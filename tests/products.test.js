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
// Fonction utilitaire
// Créer une catégorie de test
// ==================================================

const createTestCategory = async () => {

    const response = await request(app)
        .post("/api/categories")
        .set(
            "Authorization",
            `Bearer ${createAuthToken("staff")}`
        )
        .send({
            name: `Categorie Product Test ${Date.now()}`
        });

    expect(response.statusCode).toBe(201);

    return response.body.id;
};

// ==================================================
// Tests Products
// ==================================================

describe("Products API", () => {

    // --------------------------------------------------
    // GET /api/products
    // --------------------------------------------------

    test("GET /api/products doit retourner 200", async () => {

        const response = await request(app)
            .get("/api/products");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

    });


    // --------------------------------------------------
    // GET /api/products/:id
    // --------------------------------------------------

    test("GET /api/products/:id doit retourner 200", async () => {

        // Créer une catégorie de test
        const categoryId = await createTestCategory();

        // Créer un produit
        const createResponse = await request(app)
            .post("/api/products")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: "Produit GET ID Jest",
                description: "Produit créé pour tester GET par ID",
                price: 20,
                category_id: categoryId,
                available: 1
            });

        expect(createResponse.statusCode).toBe(201);

        const productId = createResponse.body.id;

        // Récupérer le produit
        const response = await request(app)
            .get(`/api/products/${productId}`);

        // Vérifier la réponse
        expect(response.statusCode).toBe(200);

        expect(response.body).toHaveProperty(
            "id",
            productId
        );

        // Nettoyage
        await request(app)
            .delete(`/api/products/${productId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            );

        await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            );

    });


    // --------------------------------------------------
    // GET /api/products/:id
    // Produit inexistant
    // --------------------------------------------------

    test("GET /api/products/:id doit retourner 404 si le produit n'existe pas", async () => {

        const response = await request(app)
            .get("/api/products/999999");

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            error: "Produit introuvable"
        });

    });


    // --------------------------------------------------
    // POST /api/products
    // --------------------------------------------------

    test("POST /api/products doit retourner 201", async () => {

        // Créer une catégorie de test
        const categoryId = await createTestCategory();

        // Créer le produit
        const response = await request(app)
            .post("/api/products")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: "Produit Test Jest",
                description: "Produit créé automatiquement par Jest",
                price: 25,
                category_id: categoryId,
                available: 1
            });

        // Vérifier la réponse
        expect(response.statusCode).toBe(201);

        expect(response.body).toHaveProperty("id");

        expect(response.body.message).toBe(
            "Produit créé avec succès"
        );

        // Nettoyage
        const productId = response.body.id;

        await request(app)
            .delete(`/api/products/${productId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            );

        await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            );

    });


    // --------------------------------------------------
    // POST /api/products
    // Données invalides
    // --------------------------------------------------

    test("POST /api/products doit retourner 400 si le nom est absent", async () => {

        const response = await request(app)
            .post("/api/products")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                description: "Produit invalide",
                price: 25,
                category_id: 1,
                available: 1
            });

        // Vérifier le code HTTP
        expect(response.statusCode).toBe(400);

        expect(response.body).toHaveProperty("error");

    });


    // --------------------------------------------------
    // PUT /api/products/:id
    // --------------------------------------------------

    test("PUT /api/products/:id doit retourner 200", async () => {

        // Créer une catégorie de test
        const categoryId = await createTestCategory();

        // Créer un produit
        const createResponse = await request(app)
            .post("/api/products")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: "Produit PUT Jest",
                description: "Produit créé pour tester PUT",
                price: 30,
                category_id: categoryId,
                available: 1
            });

        expect(createResponse.statusCode).toBe(201);

        const productId = createResponse.body.id;

        // Modifier le produit
        // PUT est réservé au rôle admin
        const updateResponse = await request(app)
            .put(`/api/products/${productId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            )
            .send({
                name: "Produit PUT Modifié",
                description: "Produit modifié par Jest",
                price: 35,
                category_id: categoryId,
                available: 1
            });

        // Vérifier la réponse
        expect(updateResponse.statusCode).toBe(200);

        expect(updateResponse.body).toEqual({
            message: "Produit modifié avec succès",
            id: Number(productId)
        });

        // Nettoyage
        await request(app)
            .delete(`/api/products/${productId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            );

        await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            );

    });


    // --------------------------------------------------
    // DELETE /api/products/:id
    // --------------------------------------------------

    test("DELETE /api/products/:id doit retourner 200", async () => {

        // Créer une catégorie de test
        const categoryId = await createTestCategory();

        // Créer un produit
        const createResponse = await request(app)
            .post("/api/products")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: "Produit DELETE Jest",
                description: "Produit créé pour tester DELETE",
                price: 40,
                category_id: categoryId,
                available: 1
            });

        expect(createResponse.statusCode).toBe(201);

        const productId = createResponse.body.id;

        // Supprimer le produit
        // DELETE est réservé au rôle admin
        const deleteResponse = await request(app)
            .delete(`/api/products/${productId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            );

        // Vérifier la réponse
        expect(deleteResponse.statusCode).toBe(200);

        expect(deleteResponse.body).toEqual({
            message: "Produit supprimé avec succès",
            id: Number(productId)
        });

        // Supprimer la catégorie
        await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set(
                "Authorization",
                `Bearer ${createAuthToken("admin")}`
            );

    });


    // --------------------------------------------------
    // POST /api/products
    // Prix négatif
    // --------------------------------------------------

    test("POST /api/products refuse un prix négatif", async () => {

        const response = await request(app)
            .post("/api/products")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: "Produit test",
                price: -10,
                category_id: 1
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.error).toBe(
            "Le prix doit être un nombre supérieur à 0"
        );

    });


    // --------------------------------------------------
    // POST /api/products
    // category_id non entier
    // --------------------------------------------------

    test("POST /api/products refuse un category_id non entier", async () => {

        const response = await request(app)
            .post("/api/products")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: "Produit test",
                price: 10,
                category_id: "abc"
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.error).toBe(
            "category_id doit être un nombre entier"
        );

    });


    // --------------------------------------------------
    // POST /api/products
    // Nom vide
    // --------------------------------------------------

    test("POST /api/products refuse un nom vide", async () => {

        const response = await request(app)
            .post("/api/products")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: "",
                price: 10,
                category_id: 1
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.error).toBe(
            "Le nom du produit est obligatoire"
        );

    });


    // --------------------------------------------------
    // POST /api/products
    // Catégorie inexistante
    // --------------------------------------------------

    test("POST /api/products refuse une catégorie inexistante", async () => {

        const response = await request(app)
            .post("/api/products")
            .set(
                "Authorization",
                `Bearer ${createAuthToken("staff")}`
            )
            .send({
                name: "Produit test",
                price: 50,
                category_id: 9999
            });

        expect(response.statusCode).toBe(404);

        expect(response.body.error).toBe(
            "La catégorie n'existe pas"
        );

    });


    // --------------------------------------------------
    // POST /api/products
    // Sans JWT
    // --------------------------------------------------

    test("POST /api/products doit retourner 401 sans JWT", async () => {

        const response = await request(app)
            .post("/api/products")
            .send({
                name: "Produit sans JWT",
                price: 20,
                category_id: 1
            });

        expect(response.statusCode).toBe(401);

        expect(response.body.error).toBe(
            "Token d'authentification manquant"
        );

    });

});

// ==================================================
// Fermer la connexion MySQL
// ==================================================

afterAll(async () => {
    await pool.end();
});