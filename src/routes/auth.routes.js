const express = require("express");
const rateLimit = require("express-rate-limit");

const {
    register,
    login,
    refresh,
    logout
} = require("../controllers/auth.controller");

const {
    validateRegisterData,
    validateLoginData,
    validateRefreshTokenData
} = require("../middleware/auth.validation");

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.AUTH_RATE_LIMIT_MAX) || (process.env.NODE_ENV === "test" ? 1000 : 20),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Trop de tentatives d'authentification, réessayez plus tard." }
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Mohamed }
 *               email: { type: string, format: email, example: mohamed@example.com }
 *               password: { type: string, format: password, example: Password123! }
 *     responses:
 *       201: { description: Utilisateur créé avec succès }
 *       400: { description: Données invalides }
 *       409: { description: Email déjà utilisé }
 */
router.post("/register", authLimiter, validateRegisterData, register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Connecte un utilisateur
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: mohamed@example.com }
 *               password: { type: string, format: password, example: Password123! }
 *     responses:
 *       200: { description: Connexion réussie avec JWT et refresh token }
 *       401: { description: Email ou mot de passe incorrect }
 */
router.post("/login", authLimiter, validateLoginData, login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Renouvelle un access token via refresh token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Nouveaux tokens émis }
 *       401: { description: Refresh token invalide ou expiré }
 */
router.post("/refresh", authLimiter, validateRefreshTokenData, refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Révoque un refresh token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Déconnexion réussie }
 *       400: { description: Refresh token requis }
 */
router.post("/logout", authLimiter, validateRefreshTokenData, logout);

module.exports = router;
