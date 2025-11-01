const IORedis = require("ioredis");
const configs = require("./configs");

function connect() {
    return new Promise((resolve, reject) => {
        const redisClient = new IORedis(configs.REDIS.getUrl(), {
            maxRetriesPerRequest: null,
            enableReadyCheck: false
        });
        redisClient.on("error", (error) => {
            console.error("Failed to connect to Redis:", error);
            reject(error);
        })
        redisClient.on("connect", () => {
            console.log("Successfully connected to Redis");
            resolve(redisClient);
        })
    })
}

module.exports = { connect };