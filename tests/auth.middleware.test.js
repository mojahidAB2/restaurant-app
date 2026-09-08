const jwt = require("jsonwebtoken");

// Même secret utilisé par le middleware pendant les tests
process.env.JWT_SECRET = "test-secret";

const authenticateToken = require("../src/middleware/auth.middleware");

describe("Middleware JWT - authenticateToken", () => {

    test("doit refuser une requête sans token", () => {
        const req = {
            headers: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            error: "Token d'authentification manquant"
        });

        expect(next).not.toHaveBeenCalled();
    });


    test("doit refuser un token JWT invalide", () => {
        const req = {
            headers: {
                authorization: "Bearer token-invalide"
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            error: "Token invalide ou expiré"
        });

        expect(next).not.toHaveBeenCalled();
    });


    test("doit accepter un token JWT valide", () => {

        const token = jwt.sign(
            {
                id: 1,
                email: "admin@restaurant.com",
                role: "admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        const req = {
            headers: {
                authorization: `Bearer ${token}`
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        authenticateToken(req, res, next);

        expect(next).toHaveBeenCalled();

        expect(req.user).toMatchObject({
            id: 1,
            email: "admin@restaurant.com",
            role: "admin"
        });

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });


    test("doit refuser un token expiré", () => {

        const token = jwt.sign(
            {
                id: 1,
                email: "admin@restaurant.com",
                role: "admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "-1s"
            }
        );

        const req = {
            headers: {
                authorization: `Bearer ${token}`
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            error: "Token invalide ou expiré"
        });

        expect(next).not.toHaveBeenCalled();
    });


  test("doit refuser un header Authorization mal formé", () => {

    const req = {
        headers: {
            authorization: "Basic abc123"
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
        error: "Format du token invalide"
    });

    expect(next).not.toHaveBeenCalled();
});
});