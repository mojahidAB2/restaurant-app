const express = require("express");

// Importe les controllers
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/products.controller");

// Importe la validation commune des produits
const validateProductData = require("../middleware/product.validation");

// Importe la validation de l'ID
const validateId = require("../middleware/id.validation");

const router = express.Router();


// ==================================================
// GET /api/products
// ==================================================

router.get(
    "/",
    getAllProducts
);

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Récupère tous les produits
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Liste des produits
 */

// ==================================================
// GET /api/products/:id
// ==================================================

router.get(
    "/:id",
    validateId,
    getProductById
);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Récupère un produit par son identifiant
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Produit trouvé
 *       400:
 *         description: Identifiant invalide
 *       404:
 *         description: Produit introuvable
 */

// ==================================================
// POST /api/products
// ==================================================

router.post(
    "/",
    validateProductData,
    createProduct
);

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Crée un produit
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pizza Margherita
 *               description:
 *                 type: string
 *                 example: Pizza tomate, mozzarella et basilic
 *               price:
 *                 type: number
 *                 example: 65
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               available:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Catégorie introuvable
 */

// ==================================================
// PUT /api/products/:id
// ==================================================

router.put(
    "/:id",
    validateId,
    validateProductData,
    updateProduct
);

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Modifie un produit
 *     tags:
 *       - Products
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
 *               - price
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pizza quatre fromages
 *               description:
 *                 type: string
 *                 example: Pizza mozzarella, parmesan et gorgonzola
 *               price:
 *                 type: number
 *                 example: 75
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               available:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Produit modifié avec succès
 *       400:
 *         description: Identifiant ou données invalides
 *       404:
 *         description: Produit introuvable
 */

// ==================================================
// DELETE /api/products/:id
// ==================================================

router.delete(
    "/:id",
    validateId,
    deleteProduct
);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Supprime un produit
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Produit supprimé avec succès
 *       400:
 *         description: Identifiant invalide
 *       404:
 *         description: Produit introuvable
 */

// ==================================================
// Exporter le router
// ==================================================

module.exports = router;