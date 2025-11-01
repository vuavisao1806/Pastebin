const { Queue } = require("bullmq");
const BaseWorker = require("./BaseWorker");

/**
 * Class BaseQueue is the wrapper of the Queue to provide some common utility.
 */
class BaseQueue extends Queue {
    constructor(name, connection) {
        super(name, { connection: connection });
        this.connection = connection;
        this.workers = [];
    }

    createWorkers(processor, numberWorkers = 1, workerOptions = {}) {
        for (let i = 0; i < numberWorkers; ++i) {
            const worker = new BaseWorker(
                this.name,
                processor,
                { connection: this.connection, ...workerOptions }
            );
            this.workers.push(worker);
        }
    }

    async stopWorkers() {
        await Promise.all(this.workers.map(worker => worker.stop()));
        this.workers = [];
    }
}

module.exports = BaseQueue;