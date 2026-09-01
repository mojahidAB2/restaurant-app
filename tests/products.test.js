const request = require("supertest");
const app = require("../app");
const pool = require("../src/config/database");
// ==================================================
// Fonction utilitaire
// Créer une catégorie de test
// ==================================================

const createTestCategory = async () => {

    const response = await request(app)
        .post("/api/categories")
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
            .delete(`/api/products/${productId}`);

        await request(app)
            .delete(`/api/categories/${categoryId}`);

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
            .delete(`/api/products/${productId}`);

        await request(app)
            .delete(`/api/categories/${categoryId}`);

    });


    // --------------------------------------------------
    // POST /api/products
    // Données invalides
    // --------------------------------------------------

    test("POST /api/products doit retourner 400 si le nom est absent", async () => {

        const response = await request(app)
            .post("/api/products")
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
        const updateResponse = await request(app)
            .put(`/api/products/${productId}`)
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
            .delete(`/api/products/${productId}`);

        await request(app)
            .delete(`/api/categories/${categoryId}`);

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
        const deleteResponse = await request(app)
            .delete(`/api/products/${productId}`);


        // Vérifier la réponse
        expect(deleteResponse.statusCode).toBe(200);

        expect(deleteResponse.body).toEqual({
            message: "Produit supprimé avec succès",
            id: Number(productId)
        });


        // Supprimer la catégorie
        await request(app)
            .delete(`/api/categories/${categoryId}`);

    });

});

// ==================================================
// Fermer la connexion MySQL
// ==================================================

afterAll(async () => {
    await pool.end();
});