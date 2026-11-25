const express = require("express");
const rateLimit = require("express-rate-limit");

const {
    register,
    login
} = require("../controllers/auth.controller");

const {
    validateRegisterData,
    validateLoginData
} = require("../middleware/auth.validation");

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
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
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mohamed
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mohamed@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données d'inscription invalides
 *       409:
 *         description: Email déjà utilisé
 *       500:
 *         description: Erreur serveur
 */

router.post(
    "/register",
    authLimiter,
    validateRegisterData,
    register
);

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
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mohamed@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Connexion réussie avec JWT
 *       401:
 *         description: Email ou mot de passe incorrect
 *       500:
 *         description: Erreur serveur
 */

router.post(
    "/login",
    authLimiter,
    validateLoginData,
    login
);

module.exports = router;