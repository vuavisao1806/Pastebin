const { StatusCodes } = require("http-status-codes");

class ApiError extends Error {
    constructor(code, message) {
        super();
        this.code = code;
        this.message = message;
    }
}

class InternalServerError extends ApiError {
    constructor(message = "Internal Server Error") {
        super(StatusCodes.INTERNAL_SERVER_ERROR, message);
    }
}

class NotFoundError extends ApiError {
    constructor(message = "Not Found Error") {
        super(StatusCodes.NOT_FOUND, message);
    }
}

class ForbiddenError extends ApiError {
    constructor(message = "Forbidden Error") {
        super(StatusCodes.FORBIDDEN, message);
    }
}

class BadRequestError extends ApiError {
    constructor(message = "Bad Request Error") {
        super(StatusCodes.BAD_REQUEST, message);
    }
}

module.exports = {
    ApiError,
    InternalServerError,
    NotFoundError,
    ForbiddenError,
    BadRequestError
}