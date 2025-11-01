const { Worker } = require("bullmq");

class BaseWorker extends Worker {
    constructor(queueName, processor, options) {
        super(queueName, processor, options);
        this.on("completed", (job) => {
            console.log(`[worker] completed job: ${job.id}`);
        })
        this.on("failed", (job, error) => {
            console.log(`[worker] failed job: ${job.id}`, error);
        })
        this.on("error", (error) => {
            console.log(`[worker] error:`, error);
        })
    }
}

module.exports = BaseWorker;