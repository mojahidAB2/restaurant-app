const LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

function defaultLevel() {
    if (process.env.LOG_LEVEL) return process.env.LOG_LEVEL;
    if (process.env.NODE_ENV === "production") return "info";
    if (process.env.NODE_ENV === "test") return "warn";
    return "debug";
}

const activeLevel = LEVELS[defaultLevel()] !== undefined ? defaultLevel() : "info";

function shouldLog(level) {
    return LEVELS[level] <= LEVELS[activeLevel];
}

function formatLog(level, message, meta = {}) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta
    };

    if (process.env.NODE_ENV === "production") {
        return JSON.stringify(entry);
    }

    const { requestId, ...rest } = meta;
    const prefix = requestId ? `[${requestId}] ` : "";
    const details = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : "";
    return `${entry.timestamp} ${level.toUpperCase()} ${prefix}${message}${details}`;
}

function write(level, message, meta) {
    if (!shouldLog(level)) return;
    const line = formatLog(level, message, meta);
    if (level === "error") {
        console.error(line);
    } else if (level === "warn") {
        console.warn(line);
    } else {
        console.log(line);
    }
}

module.exports = {
    error: (message, meta) => write("error", message, meta),
    warn: (message, meta) => write("warn", message, meta),
    info: (message, meta) => write("info", message, meta),
    debug: (message, meta) => write("debug", message, meta)
};
