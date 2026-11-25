require("dotenv").config();

// Importe l'application Express
const app = require("./app");

const PORT = Number(process.env.PORT) || 3000;

// ==================================================
// Démarrage du serveur
// ==================================================

const server = app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

const shutdown = () => {
    console.log("Arrêt du serveur...");
    server.close(() => {
        process.exit(0);
    });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);