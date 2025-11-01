const { StatusCodes, getReasonPhrase } = require("http-status-codes");

function errorHandler(err, req, res, next) {
    const code = Number.isInteger(err?.code) ? err.code : err?.status;
    const errorCode = Number.isInteger(code) && 400 <= code && code <= 599
        ? err.status : StatusCodes.INTERNAL_SERVER_ERROR;
    const body = { message: err?.message || getReasonPhrase(errorCode) };
    if (process.env.NODE_ENV !== "production" && err?.stack) {
        body.stack = err.stack;
    }
    return res.status(errorCode).json(body);
}

module.exports = errorHandler;