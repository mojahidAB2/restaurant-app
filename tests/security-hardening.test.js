const request = require("supertest");

describe("Security hardening", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
        process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
    });

    afterEach(async () => {
        try {
            const pool = require("../src/config/database");
            await pool.end();
        } catch (_) {
            // ignore if pool was not loaded
        }
        process.env = originalEnv;
    });

    test("CORS bloque les origines navigateur en production sans CORS_ORIGIN", async () => {
        process.env.NODE_ENV = "production";
        delete process.env.CORS_ORIGIN;

        const app = require("../app");
        const response = await request(app)
            .get("/health")
            .set("Origin", "https://evil.example");

        expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });

    test("CORS autorise une origine explicite en production", async () => {
        process.env.NODE_ENV = "production";
        process.env.CORS_ORIGIN = "https://app.example.com";

        const app = require("../app");
        const response = await request(app)
            .get("/health")
            .set("Origin", "https://app.example.com");

        expect(response.headers["access-control-allow-origin"]).toBe("https://app.example.com");
    });

    test("Le rate limiting auth renvoie 429 après trop de tentatives", async () => {
        process.env.NODE_ENV = "test";
        process.env.CORS_ORIGIN = "*";
        process.env.AUTH_RATE_LIMIT_MAX = "20";

        const app = require("../app");
        let lastResponse;

        for (let i = 0; i < 21; i += 1) {
            lastResponse = await request(app)
                .post("/api/auth/login")
                .send({ email: "bad-email", password: "x" });
        }

        expect(lastResponse.statusCode).toBe(429);
        expect(lastResponse.body).toEqual({
            error: "Trop de tentatives d'authentification, réessayez plus tard."
        });
    });
});
