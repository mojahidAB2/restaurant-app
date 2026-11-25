const request = require("supertest");
const app = require("../app");
const pool = require("../src/config/database");

afterAll(async () => {
    await pool.end();
});

describe("Pagination and filtering", () => {
    test("GET /api/categories supports page/limit pagination", async () => {
        const response = await request(app).get("/api/categories?page=1&limit=1");

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeLessThanOrEqual(1);
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(1);
        expect(response.body.pagination.total).toBeGreaterThanOrEqual(response.body.data.length);
    });

    test("GET /api/products supports pagination and filters", async () => {
        const response = await request(app).get("/api/products?page=1&limit=5&available=true&sort=name&order=asc");

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(5);
        for (const product of response.body.data) {
            expect(product.available === 1 || product.available === true).toBe(true);
        }
    });

    test("GET /api/products without pagination still returns array", async () => {
        const response = await request(app).get("/api/products?available=true");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
