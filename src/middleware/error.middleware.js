const logger = require("../config/logger");

const errorMiddleware = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    // Erreur JSON mal formé
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            error: "JSON invalide"
        });
    }

    const statusCode = err.statusCode || err.status || 500;
    const isServerError = statusCode >= 500;

    if (isServerError) {
        logger.error("server_error", {
            requestId: req.requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode,
            message: err.message,
            stack: process.env.NODE_ENV === "production" ? undefined : err.stack
        });
    }

    const message = isServerError
        ? "Erreur interne du serveur"
        : err.message || "Erreur";

    res.status(statusCode).json({
        error: message
    });
};

module.exports = errorMiddleware;