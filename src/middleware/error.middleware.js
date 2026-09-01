// ==================================================
// Middleware global de gestion des erreurs
// ==================================================

const errorMiddleware = (err, req, res, next) => {

    // Affiche l'erreur dans le terminal
    console.error("❌ Erreur :", err);


    // Vérifie si une réponse a déjà été envoyée
    if (res.headersSent) {
        return next(err);
    }


    // Retourne une erreur générique au client
    res.status(500).json({
        error: "Erreur serveur"
    });
};


// ==================================================
// Exporter le middleware
// ==================================================

module.exports = errorMiddleware;