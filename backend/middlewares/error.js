class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === "CastError") {
        message = `Invalid ${err.path}`;
        statusCode = 400;
    }

    if (err.name === "JsonWebTokenError") {
        message = "JSON Web Token is invalid. Try again.";
        statusCode = 400;
    }

    if (err.name === "TokenExpiredError") {
        message = "JSON Web Token has expired. Try again.";
        statusCode = 400;
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate field value entered: ${field}`;
        statusCode = 400;
    }

    console.error("Error:", err);

    return res.status(statusCode).json({
        success: false,
        message,
    });
};

export default ErrorHandler;
