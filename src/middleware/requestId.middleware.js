const crypto = require("crypto");

const requestIdMiddleware = (req, res, next) => {
    const incomingId = req.headers["x-request-id"];
    const requestId = typeof incomingId === "string" && incomingId.trim() !== ""
        ? incomingId.trim().slice(0, 128)
        : crypto.randomUUID();

    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);
    next();
};

module.exports = requestIdMiddleware;
