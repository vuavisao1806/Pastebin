const mongoose = require("mongoose");
const BaseQueue = require("./BaseQueue");
const BaseCompetingConsumer = require("./BaseCompetingConsumer");
// const Document = require("../../database/model");
const { BadRequestError } = require("../ApiError");
const { getDocumentModel, getShardIndexByKeyId } = require("../../database/shards");
const CircuitBreaker = require("opossum");
const {getShardIndex} = require("../hash");

const POST_COMPETING_CONSUMER_NUMBER = 8;

class PostQueue extends BaseQueue {
    constructor(name, redisConnection) {
        super(name, redisConnection);

        this.circuitBreakers = new Map();

        for (let i = 0; i < POST_COMPETING_CONSUMER_NUMBER; ++i) {
            this.competingConsumers.push(this.createPostCompetingConsumer());
        }
    }

    getCircuitBreakerForShardId(shardId) {
        if (!this.circuitBreakers.has(shardId)) {
            const circuitBreaker = new CircuitBreaker(
                async (Document, payload) => Document.create(payload), {
                    timeout: 3000,
                    errorThresholdPercentage: 50,
                    resetTimeout: 15000
                }
            );
            this.circuitBreakers.set(shardId, circuitBreaker);
        }
        return this.circuitBreakers.get(shardId);
    }

    createPostCompetingConsumer() {
        return new BaseCompetingConsumer(
            "post-queue",
            async (job) => {
                try {
                    const { title, pasteValue, expiryTime } = job.data;

                    const _id = new mongoose.Types.ObjectId();
                    const key = _id.toString();

                    const Document = getDocumentModel(key);
                    const shardIndex = getShardIndexByKeyId(key);

                    const circuitBreaker = this.getCircuitBreakerForShardId(shardIndex);

                    const payload = {
                        _id,
                        title,
                        pasteValue,
                        uploadTime: new Date(),
                        expiryTime: calculateExpiryTime(expiryTime)
                    };

                    const document = await circuitBreaker.fire(Document, payload);

                    // const document = await Document.create(payload);
                    return { id: document._id.toString() };
                } catch (error) {
                    console.error(`Job ${job.id} failed:`, error);
                    throw error;
                }
            },
            {
                connection: this.redisConnection,
                // limiter: {
                //     max: 8,
                //     duration: 20
                // }
            }
        );
    }
}

function calculateExpiryTime(expiryOption) {
    if (expiryOption === "never") {
        return null;
    } else if (expiryOption === "1minute") {
        return new Date(Date.now() + 60 * 1000);
    }
    else if (expiryOption === "10minutes") {
        return new Date(Date.now() + 10 * 60 * 1000);
    }
    else if (expiryOption === "1day") {
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    else if (expiryOption === "2days") {
        return new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    }
    else if (expiryOption === "1week") {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    throw new BadRequestError("Invalid Expiry Option");
}

module.exports = PostQueue;