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
    }
}

module.exports = configs;