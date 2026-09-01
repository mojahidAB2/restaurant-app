const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Restaurant API",
            version: "1.0.0",
            description: "API de gestion des catégories et produits du restaurant"
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Serveur local"
            }
        ]
    },
   apis: [
    "./app.js",
    "./src/routes/*.js"
]
};

module.exports = swaggerJsdoc(options);