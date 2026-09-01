const express = require("express");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");

// Importe le middleware 404
const notFoundMiddleware = require("./src/middleware/notFound.middleware");

// Importe le middleware global d'erreur
const errorMiddleware = require("./src/middleware/error.middleware");

// Importe les routes des produits
const productsRoutes = require("./src/routes/products.routes");

// Importe les routes des catégories
const categoriesRoutes = require("./src/routes/categories.routes");

const app = express();


// ==================================================
// Middleware
// ==================================================

// Permet à Express de lire les données JSON
app.use(express.json());

// Sécurité des headers HTTP
app.use(helmet());

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);
/**
 * @openapi
 * /health:
 *   get:
 *     summary: Vérifie l’état de l’API et de la base de données
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API et base de données disponibles
 *       503:
 *         description: Base de données indisponible
 */

// ==================================================
// Routes
// ==================================================

// Routes des produits
app.use("/api/products", productsRoutes);

// Routes des catégories
app.use("/api/categories", categoriesRoutes);


// ==================================================
// Route principale
// ==================================================

app.get("/", (req, res) => {
    res.json({
        message: "Restaurant API fonctionne !"
    });
});

const pool = require("./src/config/database");

app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            status: "ok",
            database: "connected"
        });
    } catch (error) {
        res.status(503).json({
            status: "error",
            database: "unavailable"
        });
    }
});

// ==================================================
// Middleware 404
// ==================================================

app.use(notFoundMiddleware);


// ==================================================
// Middleware global de gestion des erreurs
// ==================================================

app.use(errorMiddleware);


// ==================================================
// Exporter l'application
// ==================================================

module.exports = app;