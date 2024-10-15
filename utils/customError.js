



class CustomError extends Error {
    constructor(message, statusCode) {
        super(message); // Call parent constructor (Error)
        this.statusCode = statusCode; // Assign custom status code
        this.message = message;
    }
}


class BadRequestError extends CustomError {
    constructor(message) {
        super(message, 400); // 400 Bad Request
    }
}

class UnauthorizedError extends CustomError {
    constructor(message) {
        super(message, 401); // 401 Unauthorized
    }
}

class ForbiddenError extends CustomError {
    constructor(message) {
        super(message, 403); // 403 Forbidden
    }
}

class MethodNotAllowedError extends CustomError {
    constructor(message) {
        super(message, 405); // 405 Method Not Allowed
    }
}

class ConflictError extends CustomError {
    constructor(message) {
        super(message, 409); // 409 Conflict
    }
}

class TooManyRequestsError extends CustomError {
    constructor(message) {
        super(message, 429); // 429 Too Many Requests
    }
}

class NotImplementedError extends CustomError {
    constructor(message) {
        super(message, 501); // 501 Not Implemented
    }
}

class BadGatewayError extends CustomError {
    constructor(message) {
        super(message, 502); // 502 Bad Gateway
    }
}

class ServiceUnavailableError extends CustomError {
    constructor(message) {
        super(message, 503); // 503 Service Unavailable
    }
}

class GatewayTimeoutError extends CustomError {
    constructor(message) {
        super(message, 504); // 504 Gateway Timeout
    }
}

class NotFoundError extends CustomError {
    constructor(message) {
        super(message, 404); // 404 Not Found
    }
}

module.exports = {
    CustomError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    MethodNotAllowedError,
    ConflictError,
    TooManyRequestsError,
    NotImplementedError,
    BadGatewayError,
    ServiceUnavailableError,
    GatewayTimeoutError,
    NotFoundError
};
