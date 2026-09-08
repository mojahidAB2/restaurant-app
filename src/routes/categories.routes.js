const express = require("express");
const authorizeRoles = require("../middleware/role.middleware");
// Importe les controllers
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categories.controller");

// Importe la validation commune des catégories
const validateCategoryData = require("../middleware/category.validation");

// Importe la validation de l'ID
const validateId = require("../middleware/id.validation");

// Importe le middleware d'authentification JWT
const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Récupère toutes les catégories
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: Liste des catégories
 */
router.get("/", getAllCategories);

/**
 * @openapi
 * /api/categories/{id}:
 *   get:
 *     summary: Récupère une catégorie par son identifiant
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Catégorie trouvée
 *       400:
 *         description: Identifiant invalide
 *       404:
 *         description: Catégorie introuvable
 */
router.get("/:id", validateId, getCategoryById);

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Crée une catégorie
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pizzas
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Token d'authentification manquant ou invalide
 */
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "staff"),
    validateCategoryData,
    createCategory
);

/**
 * @openapi
 * /api/categories/{id}:
 *   put:
 *     summary: Modifie une catégorie
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pizzas italiennes
 *     responses:
 *       200:
 *         description: Catégorie modifiée avec succès
 *       400:
 *         description: Identifiant ou données invalides
 *       401:
 *         description: Token d'authentification manquant ou invalide
 *       404:
 *         description: Catégorie introuvable
 */
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    validateId,
    validateCategoryData,
    updateCategory
);

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Supprime une catégorie
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Catégorie supprimée avec succès
 *       400:
 *         description: Identifiant invalide
 *       401:
 *         description: Token d'authentification manquant ou invalide
 *       404:
 *         description: Catégorie introuvable
 */
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    validateId,
    deleteCategory
);

module.exports = router;