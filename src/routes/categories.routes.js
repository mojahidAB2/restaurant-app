const express = require("express");

// Importe les controllers des catégories
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categories.controller");

// Importe la validation commune des catégories
const validateCategoryData = require("../middleware/category.validation");

// Importe la validation de l'identifiant
const validateId = require("../middleware/id.validation");

const router = express.Router();


// ==================================================
// GET /api/categories
// Récupérer toutes les catégories
// ==================================================

router.get(
    "/",
    getAllCategories
);
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

// ==================================================
// GET /api/categories/:id
// Récupérer une catégorie
// ==================================================

router.get(
    "/:id",
    validateId,
    getCategoryById
);

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


// ==================================================
// POST /api/categories
// Créer une catégorie
// ==================================================

router.post(
    "/",
    validateCategoryData,
    createCategory
);

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Crée une catégorie
 *     tags:
 *       - Categories
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
 *                 example: Boissons
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 *       400:
 *         description: Nom absent ou invalide
 *       409:
 *         description: Catégorie déjà existante
 */

// ==================================================
// PUT /api/categories/:id
// Modifier une catégorie
// ==================================================

router.put(
    "/:id",
    validateId,
    validateCategoryData,
    updateCategory
);

/**
 * @openapi
 * /api/categories/{id}:
 *   put:
 *     summary: Modifie une catégorie
 *     tags:
 *       - Categories
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
 *                 example: Desserts
 *     responses:
 *       200:
 *         description: Catégorie modifiée avec succès
 *       400:
 *         description: Identifiant ou nom invalide
 *       404:
 *         description: Catégorie introuvable
 */

// ==================================================
// DELETE /api/categories/:id
// Supprimer une catégorie
// ==================================================

router.delete(
    "/:id",
    validateId,
    deleteCategory
);

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Supprime une catégorie
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
 *         description: Catégorie supprimée avec succès
 *       400:
 *         description: Identifiant invalide
 *       404:
 *         description: Catégorie introuvable
 */


// ==================================================
// Exporter le router
// ==================================================

module.exports = router;