const { Worker } = require("bullmq");

class BaseCompetingConsumer extends Worker {
    constructor(...args) {
        super(...args);
        this.setMaxListeners(Infinity);

        this.on("error", (error) => {
            console.error("Post queue error:", error);
        });

        this.on("failed", (job, error) => {
            console.error("Post job failed:", job.id, error);
        });

        this.on("completed", (job) => {
            console.log("Job completed:", job.id);
        });
    }
}

module.exports = BaseCompetingConsumer;
