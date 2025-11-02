const BaseQueue = require("./BaseQueue");
const BaseCompetingConsumer = require("./BaseCompetingConsumer");
const Document = require("../../models/model");
const { BadRequestError } = require("../ApiError");

const POST_COMPETING_CONSUMER_NUMBER = 1;

class PostQueue extends BaseQueue {
    constructor(name, redisConnection) {
        super(name, redisConnection);

        for (let i = 0; i < POST_COMPETING_CONSUMER_NUMBER; ++i) {
            this.competingConsumers.push(this.createPostCompetingConsumer());
        }
    }

    createPostCompetingConsumer() {
        return new BaseCompetingConsumer(
            "post-queue",
            async (job) => {
                try {
                    const { title, pasteValue, expiryTime } = job.data;
                    const document = await Document.create({
                        title,
                        pasteValue,
                        uploadTime: new Date(),
                        expiryTime: calculateExpiryTime(expiryTime)
                    });
                    return { id: document._id.toString() };
                } catch (error) {
                    console.error(`Job ${job.id} failed:`, error);
                    throw error;
                }
            },
            { connection: this.redisConnection }
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