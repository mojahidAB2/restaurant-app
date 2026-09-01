// Importe l'application Express
const app = require("./app");

const PORT = 3000;


// ==================================================
// Démarrage du serveur
// ==================================================

app.listen(PORT, () => {
    console.log(
        `🚀 Serveur démarré sur http://localhost:${PORT}`
    );
});