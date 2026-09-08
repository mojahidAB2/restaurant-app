const errorMiddleware = (err, req, res, next) => {
    console.error("❌ Erreur :", err);

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

    // Ne pas exposer les détails internes en production
    const message =
        statusCode >= 500
            ? "Erreur interne du serveur"
            : err.message || "Erreur";

    res.status(statusCode).json({
        error: message
    });
};

module.exports = errorMiddleware;