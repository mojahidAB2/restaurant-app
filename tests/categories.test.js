require("dotenv").config();

const request = require("supertest");
const app = require("../app");
const pool = require("../src/config/database");
const jwt = require("jsonwebtoken");

// ==================================================
// Fonction utilitaire
// Créer un token JWT de test
// ==================================================

const createAuthToken = (role = "staff") => {
    return jwt.sign(
        {
            id: role === "admin" ? 2 : 1,
            role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );
};

// ==================================================
// Tests Categories
// ==================================================

describe("Categories API", () => {

    // --------------------------------------------------
    // GET /api/categories
    // --------------------------------------------------

    test("GET /api/categories doit retourner 200", async () => {

        const response = await request(app)
            .get("/api/categories");

        expect(response.statusCode).toBe(200);

        expect(Array.isArray(response.body)).toBe(true);

    });


    // --------------------------------------------------
    // GET /api/categories/:id
    // --------------------------------------------------

    test("GET /api/categories/:id doit retourner 200", async () => {

        // Créer une catégorie de test
        const createResponse = await request(app)
            .post("/api/categories")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: `Categorie GET ID Jest ${Date.now()}`
            });

        expect(createResponse.statusCode).toBe(201);

        const categoryId = createResponse.body.id;


        // Récupérer la catégorie
        const response = await request(app)
            .get(`/api/categories/${categoryId}`);


        // Vérifier la réponse
        expect(response.statusCode).toBe(200);

        expect(response.body).toHaveProperty(
            "id",
            categoryId
        );


        // Nettoyage
        await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            );

    });


    // --------------------------------------------------
    // GET /api/categories/:id
    // Catégorie inexistante
    // --------------------------------------------------

    test("GET /api/categories/:id doit retourner 404 si la catégorie n'existe pas", async () => {

        const response = await request(app)
            .get("/api/categories/999999");

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            error: "Catégorie introuvable"
        });

    });


    // --------------------------------------------------
    // POST /api/categories
    // --------------------------------------------------

    test("POST /api/categories doit retourner 201", async () => {

        const categoryName =
            `Categorie Test Jest ${Date.now()}`;


        const response = await request(app)
            .post("/api/categories")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: categoryName
            });


        // Vérifier la réponse
        expect(response.statusCode).toBe(201);

        expect(response.body).toHaveProperty("id");

        expect(response.body.message).toBe(
            "Catégorie créée avec succès"
        );


        // Nettoyage
        const categoryId = response.body.id;

        await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            );

    });


    // --------------------------------------------------
    // POST /api/categories
    // Données invalides
    // --------------------------------------------------

    test("POST /api/categories doit retourner 400 si le nom est absent", async () => {

        const response = await request(app)
            .post("/api/categories")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({});


        // Vérifier le code HTTP
        expect(response.statusCode).toBe(400);

        expect(response.body).toHaveProperty("error");

    });


    // --------------------------------------------------
    // POST /api/categories
    // Doublon
    // --------------------------------------------------

    test("POST /api/categories doit retourner 409 si la catégorie existe déjà", async () => {

        const categoryName =
            `Categorie Test Jest 409 ${Date.now()}`;


        // Première création
        const firstResponse = await request(app)
            .post("/api/categories")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: categoryName
            });

        expect(firstResponse.statusCode).toBe(201);

        const categoryId = firstResponse.body.id;


        // Deuxième création avec le même nom
        const secondResponse = await request(app)
            .post("/api/categories")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: categoryName
            });


        // Vérifier le conflit
        expect(secondResponse.statusCode).toBe(409);

        expect(secondResponse.body).toEqual({
            error: "Cette catégorie existe déjà"
        });


        // Nettoyage
        await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            );

    });


    // --------------------------------------------------
    // PUT /api/categories/:id
    // --------------------------------------------------

    test("PUT /api/categories/:id doit retourner 200", async () => {

        // Créer une catégorie
        const createResponse = await request(app)
            .post("/api/categories")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: `Categorie PUT Jest ${Date.now()}`
            });

        expect(createResponse.statusCode).toBe(201);

        const categoryId = createResponse.body.id;


        // Modifier la catégorie
        // PUT est réservé au rôle admin
        const updateResponse = await request(app)
            .put(`/api/categories/${categoryId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            )
            .send({
                name: `Categorie PUT Modifiee ${Date.now()}`
            });


        // Vérifier la réponse
        expect(updateResponse.statusCode).toBe(200);

        expect(updateResponse.body).toEqual({
            message: "Catégorie modifiée avec succès",
            id: Number(categoryId)
        });


        // Nettoyage
        await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            );

    });


    // --------------------------------------------------
    // DELETE /api/categories/:id
    // --------------------------------------------------

    test("DELETE /api/categories/:id doit retourner 200", async () => {

        // Créer une catégorie
        const createResponse = await request(app)
            .post("/api/categories")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: `Categorie DELETE Jest ${Date.now()}`
            });

        expect(createResponse.statusCode).toBe(201);

        const categoryId = createResponse.body.id;


        // Supprimer la catégorie
        const deleteResponse = await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            );


        // Vérifier la réponse
        expect(deleteResponse.statusCode).toBe(200);

        expect(deleteResponse.body).toEqual({
            message: "Catégorie supprimée avec succès",
            id: Number(categoryId)
        });

    });


    // --------------------------------------------------
    // POST /api/categories
    // Nom vide
    // --------------------------------------------------

    test("POST /api/categories refuse un nom vide", async () => {

        const response = await request(app)
            .post("/api/categories")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: ""
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.error).toBe(
            "Le nom de la catégorie est obligatoire"
        );

    });


    // --------------------------------------------------
    // POST /api/categories
    // Nom composé uniquement d'espaces
    // --------------------------------------------------

    test("POST /api/categories refuse un nom composé uniquement d'espaces", async () => {

        const response = await request(app)
            .post("/api/categories")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: "   "
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.error).toBe(
            "Le nom de la catégorie est obligatoire"
        );

    });


    // --------------------------------------------------
    // POST /api/categories
    // Nom qui n'est pas une chaîne
    // --------------------------------------------------

    test("POST /api/categories refuse un nom qui n'est pas une chaîne", async () => {

        const response = await request(app)
            .post("/api/categories")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: 123
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.error).toBe(
            "Le nom de la catégorie est obligatoire"
        );

    });


    // --------------------------------------------------
    // POST /api/categories
    // Nom absent
    // --------------------------------------------------

    test("POST /api/categories refuse un nom absent", async () => {

        const response = await request(app)
            .post("/api/categories")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({});

        expect(response.statusCode).toBe(400);

        expect(response.body.error).toBe(
            "Le nom de la catégorie est obligatoire"
        );

    });


    // --------------------------------------------------
    // POST /api/categories
    // Sans JWT
    // --------------------------------------------------

    test("POST /api/categories doit retourner 401 sans JWT", async () => {

        const response = await request(app)
            .post("/api/categories")
            .send({
                name: `Categorie Sans JWT ${Date.now()}`
            });

        expect(response.statusCode).toBe(401);

        expect(response.body.error).toBe(
            "Token d'authentification manquant"
        );

    });


    // --------------------------------------------------
    // DELETE /api/categories/:id
    // Staff interdit
    // --------------------------------------------------

    test("DELETE /api/categories/:id doit retourner 403 pour un staff", async () => {

        // Créer une catégorie
        const createResponse = await request(app)
            .post("/api/categories")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: `Categorie RBAC Jest ${Date.now()}`
            });

        expect(createResponse.statusCode).toBe(201);

        const categoryId = createResponse.body.id;


        // Tentative de suppression avec staff
        const deleteResponse = await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            );


        // Vérifier l'accès interdit
        expect(deleteResponse.statusCode).toBe(403);

        expect(deleteResponse.body).toEqual({
            error: "Accès interdit pour ce rôle"
        });


        // Nettoyage avec admin
        await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            );

    });

});

// ==================================================
// Fermer la connexion MySQL
// ==================================================

afterAll(async () => {
    await pool.end();
});