require("dotenv").config();

const request = require("supertest");
const app = require("../app");
const pool = require("../src/config/database");

// ==================================================
// Fonction utilitaire
// Générer un email unique pour les tests
// ==================================================

const createTestEmail = () => {
    return `jest.auth.${Date.now()}@example.com`;
};

// ==================================================
// Tests Authentication
// ==================================================

describe("Authentication API", () => {

    // --------------------------------------------------
    // POST /api/auth/register
    // Création d'un utilisateur
    // --------------------------------------------------

    test("POST /api/auth/register doit retourner 201", async () => {

        const email = createTestEmail();

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Utilisateur Jest",
                email,
                password: "Password123!"
            });


        // Vérifier le code HTTP
        expect(response.statusCode).toBe(201);

        // Vérifier la réponse
        expect(response.body).toHaveProperty("message");

        expect(response.body.message).toBe(
            "Utilisateur créé avec succès"
        );

        expect(response.body.user).toHaveProperty("id");

        expect(response.body.user).toHaveProperty(
            "name",
            "Utilisateur Jest"
        );

        expect(response.body.user).toHaveProperty(
            "email",
            email
        );

        expect(response.body.user).toHaveProperty(
            "role",
            "staff"
        );


        // Nettoyage
        await pool.query(
            "DELETE FROM users WHERE email = ?",
            [email]
        );

    });


    // --------------------------------------------------
    // POST /api/auth/register
    // Email déjà utilisé
    // --------------------------------------------------

    test("POST /api/auth/register doit retourner 409 si l'email existe déjà", async () => {

        const email = createTestEmail();


        // Première inscription
        const firstResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Utilisateur Duplicate",
                email,
                password: "Password123!"
            });

        expect(firstResponse.statusCode).toBe(201);


        // Deuxième inscription avec le même email
        const secondResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Utilisateur Duplicate 2",
                email,
                password: "Password456!"
            });


        // Vérifier le conflit
        expect(secondResponse.statusCode).toBe(409);

        expect(secondResponse.body).toEqual({
            error: "Cet email est déjà utilisé"
        });


        // Nettoyage
        await pool.query(
            "DELETE FROM users WHERE email = ?",
            [email]
        );

    });


    // --------------------------------------------------
    // POST /api/auth/register
    // Nom absent
    // --------------------------------------------------

    test("POST /api/auth/register refuse un nom absent", async () => {

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: createTestEmail(),
                password: "Password123!"
            });


        expect(response.statusCode).toBe(400);

        expect(response.body.error).toBe(
            "Le nom est obligatoire"
        );

    });


    // --------------------------------------------------
    // POST /api/auth/register
    // Email invalide
    // --------------------------------------------------

    test("POST /api/auth/register refuse un email invalide", async () => {

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Utilisateur Jest",
                email: "email-invalide",
                password: "Password123!"
            });


        expect(response.statusCode).toBe(400);

        expect(response.body.error).toBe(
            "L'email est invalide"
        );

    });


    // --------------------------------------------------
    // POST /api/auth/register
    // Mot de passe trop court
    // --------------------------------------------------

    test("POST /api/auth/register refuse un mot de passe trop court", async () => {

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Utilisateur Jest",
                email: createTestEmail(),
                password: "1234567"
            });


        expect(response.statusCode).toBe(400);

        expect(response.body.error).toBe(
            "Le mot de passe doit contenir au moins 8 caractères"
        );

    });


    // --------------------------------------------------
    // POST /api/auth/login
    // Connexion réussie
    // --------------------------------------------------

    test("POST /api/auth/login doit retourner 200 avec un JWT", async () => {

        const email = createTestEmail();
        const password = "Password123!";


        // Créer un utilisateur
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Utilisateur Login Jest",
                email,
                password
            });

        expect(registerResponse.statusCode).toBe(201);


        // Se connecter
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });


        // Vérifier le code HTTP
        expect(loginResponse.statusCode).toBe(200);

        // Vérifier la présence du JWT
        expect(loginResponse.body).toHaveProperty("token");

        expect(typeof loginResponse.body.token).toBe(
            "string"
        );

        expect(loginResponse.body.token.length).toBeGreaterThan(
            0
        );


        // Vérifier les informations utilisateur
        expect(loginResponse.body.user).toEqual(
            expect.objectContaining({
                name: "Utilisateur Login Jest",
                email,
                role: "staff"
            })
        );


        // Nettoyage
        await pool.query(
            "DELETE FROM users WHERE email = ?",
            [email]
        );

    });


    // --------------------------------------------------
    // POST /api/auth/login
    // Email inexistant
    // --------------------------------------------------

    test("POST /api/auth/login doit retourner 401 si l'email n'existe pas", async () => {

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: `inexistant.${Date.now()}@example.com`,
                password: "Password123!"
            });


        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            error: "Email ou mot de passe incorrect"
        });

    });


    // --------------------------------------------------
    // POST /api/auth/login
    // Mauvais mot de passe
    // --------------------------------------------------

    test("POST /api/auth/login doit retourner 401 si le mot de passe est incorrect", async () => {

        const email = createTestEmail();
        const password = "Password123!";


        // Créer un utilisateur
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Utilisateur Wrong Password",
                email,
                password
            });

        expect(registerResponse.statusCode).toBe(201);


        // Tentative de connexion avec mauvais mot de passe
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password: "MauvaisPassword123!"
            });


        expect(loginResponse.statusCode).toBe(401);

        expect(loginResponse.body).toEqual({
            error: "Email ou mot de passe incorrect"
        });


        // Nettoyage
        await pool.query(
            "DELETE FROM users WHERE email = ?",
            [email]
        );

    });

});

// ==================================================
// Fermer la connexion MySQL
// ==================================================

afterAll(async () => {
    await pool.end();
});