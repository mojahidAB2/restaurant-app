const express = require("express");
const authorizeRoles = require("../middleware/role.middleware");

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

// Importe le middleware d'authentification JWT
const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

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
router.get("/", getAllProducts);

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
router.get("/:id", validateId, getProductById);

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Crée un produit
 *     tags:
 *       - Products
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
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Token d'authentification manquant ou invalide
 *       404:
 *         description: Catégorie introuvable
 */
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "staff"),
    validateProductData,
    createProduct
);
/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Modifie un produit
 *     tags:
 *       - Products
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
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Produit modifié avec succès
 *       400:
 *         description: Identifiant ou données invalides
 *       401:
 *         description: Token d'authentification manquant ou invalide
 *       404:
 *         description: Produit ou catégorie introuvable
 */
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    validateId,
    validateProductData,
    updateProduct
);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Supprime un produit
 *     tags:
 *       - Products
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
 *         description: Produit supprimé avec succès
 *       400:
 *         description: Identifiant invalide
 *       401:
 *         description: Token d'authentification manquant ou invalide
 *       404:
 *         description: Produit introuvable
 */
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    validateId,
    deleteProduct
);

module.exports = router;