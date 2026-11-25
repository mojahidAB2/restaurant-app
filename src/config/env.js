const logger = require("./logger");

function validateEnv() {
    const isProduction = process.env.NODE_ENV === "production";
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        const message = "JWT_SECRET est requis pour démarrer l'API";
        if (isProduction) {
            throw new Error(message);
        }
        logger.warn("missing_jwt_secret", { message });
    }

    if (isProduction && jwtSecret && jwtSecret.length < 32) {
        throw new Error("JWT_SECRET doit contenir au moins 32 caractères en production");
    }

    if (isProduction && !process.env.CORS_ORIGIN) {
        logger.warn("missing_cors_origin", {
            message: "CORS_ORIGIN n'est pas défini; les requêtes cross-origin navigateur seront bloquées"
        });
    }
}

module.exports = {
    validateEnv
};
