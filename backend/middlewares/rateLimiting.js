const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');

function create(client) {
    return rateLimit({
        windowMs: 5 * 60 * 1000,
        limit: 100,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        ipv6Subnet: 56,
        store: new RedisStore({
            sendCommand: (...args) => client.call(...args)
        }),
        handler: (req, res, next, options) => {
            res.status(options.statusCode).json({ message: options.message });
        }
    });
}

module.exports = create;