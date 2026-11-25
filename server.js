require("dotenv").config();

// Importe l'application Express
const app = require("./app");
const logger = require("./src/config/logger");
const { validateEnv } = require("./src/config/env");

validateEnv();

const PORT = Number(process.env.PORT) || 3000;

// ==================================================
// Démarrage du serveur
// ==================================================

const server = app.listen(PORT, () => {
    logger.info("server_started", { port: PORT, url: `http://localhost:${PORT}` });
});

const shutdown = (signal) => {
    logger.info("server_shutdown", { signal });
    server.close(() => {
        process.exit(0);
    });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
    logger.error("unhandled_rejection", {
        message: reason instanceof Error ? reason.message : String(reason)
    });
});

process.on("uncaughtException", (error) => {
    logger.error("uncaught_exception", { message: error.message, stack: error.stack });
    process.exit(1);
});