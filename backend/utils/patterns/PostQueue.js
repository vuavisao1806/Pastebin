const BaseQueue = require("./BaseQueue");
const BaseCompetingConsumer = require("./BaseCompetingConsumer");
const Document = require("../../models/model");
const { BadRequestError } = require("../ApiError");

const POST_WORKER_NUMS = 1;

class PostQueue extends BaseQueue {
    constructor(name, redisConnection) {
        super(name, redisConnection);

        for (let i = 0; i < POST_WORKER_NUMS; ++i) {
            this.workers.push(this.createPostWorker());
        }
    }

    createPostWorker() {
        return new BaseCompetingConsumer(
            "post-queue",
            async (job) => {
                try {
                    const { _id, title, pasteValue, expiryTime } = job.data;

                    await Document.findByIdAndUpdate(
                        _id,
                        {
                            _id,
                            title,
                            pasteValue,
                            uploadTime: new Date(),
                            expiryTime: calculateExpiryTime(expiryTime),
                        },
                        { upsert: true, new: true }
                    );

                    return { id: _id };
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