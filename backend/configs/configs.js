const net = require("node:net");

const configs = {
    BASE: {
        PORT: process.env.PORT || 3000,
        HOST: process.env.HOST || "127.0.0.1",
        getUrl() {
            const host = this.HOST;
            const isLocalOrPort = (host === "localhost") || (net.isIP(host) !== 0);
            return `${isLocalOrPort ? "http" : "https"}://${host}:${this.PORT}`;
        }
    },
    MONGO: {
        URI: process.env.MONGO_URI || "mongodb://localhost:27017/pastebin",
    },
    REDIS: {
        PORT: process.env.REDIS_PORT || 6379,
        HOST: process.env.REDIS_HOST || "127.0.0.1",
        URI: process.env.REDIS_URI || null,
        getUrl() {
            if (this.URI) return this.URI;
            return `redis://${this.HOST}:${this.PORT}`;
        }
    },
}

module.exports = configs;