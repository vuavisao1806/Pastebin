const { Queue } = require("bullmq");

/**
 * Class BaseQueue is the wrapper of the Queue to provide some common utility.
 */
class BaseQueue extends Queue {
    constructor(name, redisConnection) {
        super(name, {
            connection: redisConnection,
            defaultJobOptions: {
                attempts: 5,
                backoff: { type: "exponential", default: 1000 },
                removeOnFail: false
            }
        });
        this.redisConnection = redisConnection;
        this.competingConsumers = [];
        this.setMaxListeners(Infinity);
    }
}

module.exports = BaseQueue;
