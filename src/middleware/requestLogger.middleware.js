const logger = require("../config/logger");

const requestLoggerMiddleware = (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

        logger[level]("http_request", {
            requestId: req.requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Math.round(durationMs * 100) / 100,
            ip: req.ip
        });
    });

    next();
};

module.exports = requestLoggerMiddleware;
