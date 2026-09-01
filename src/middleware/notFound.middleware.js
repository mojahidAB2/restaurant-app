// ==================================================
// Middleware pour les routes inexistantes
// ==================================================

const notFoundMiddleware = (req, res, next) => {
    res.status(404).json({
        error: "Route introuvable"
    });
};


// ==================================================
// Exporter le middleware
// ==================================================

module.exports = notFoundMiddleware;