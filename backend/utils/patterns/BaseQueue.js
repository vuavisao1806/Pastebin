const { Queue } = require("bullmq");

/**
 * Class BaseQueue is the wrapper of the Queue to provide some common utility.
 */
class BaseQueue extends Queue {
    constructor(name, redisConnection) {
        super(name, { connection: redisConnection });
        this.redisConnection = redisConnection;
        this.competingConsumers = [];
        this.setMaxListeners(Infinity);
    }
}

module.exports = BaseQueue;
