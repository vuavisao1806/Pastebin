const { StatusCodes, getReasonPhrase } = require("http-status-codes");

function notFoundHandler(req, res, next) {
    return res.status(StatusCodes.NOT_FOUND).json({
        message: getReasonPhrase(req),
        path: req.path,
        method: req.method,
    })
}

module.exports = notFoundHandler;