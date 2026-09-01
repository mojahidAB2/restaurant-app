// Importe les fonctions du service des produits
const {
    findAllProducts,
    findProductById,
    categoryExists,
    createProduct: createProductService,
    updateProduct: updateProductService,
    deleteProduct: deleteProductService
} = require("../services/products.service");


// ==================================================
// GET /api/products
// Récupérer tous les produits
// ==================================================

const getAllProducts = async (req, res, next) => {
    try {
        // Demande au service de récupérer tous les produits
        const products = await findAllProducts();

        // Retourne les produits au client
        res.json(products);

    } catch (error) {
        // Envoie l'erreur au middleware global
        next(error);
    }
};


// ==================================================
// GET /api/products/:id
// Récupérer un seul produit
// ==================================================

const getProductById = async (req, res, next) => {
    try {
        // Récupère l'identifiant depuis l'URL
        const { id } = req.params;

        // Demande au service de rechercher le produit
        const product = await findProductById(id);

        // Vérifie si le produit existe
        if (!product) {
            return res.status(404).json({
                error: "Produit introuvable"
            });
        }

        // Retourne le produit
        res.json(product);

    } catch (error) {
        // Envoie l'erreur au middleware global
        next(error);
    }
};


// ==================================================
// POST /api/products
// Ajouter un nouveau produit
// ==================================================

const createProduct = async (req, res, next) => {
    try {
        // Les données ont déjà été validées
        // par le middleware validateCreateProduct

        // Récupère les données envoyées par le client
        const {
            name,
            description,
            price,
            category_id,
            available
        } = req.body;


        // Vérifie que la catégorie existe
        const exists = await categoryExists(category_id);

        if (!exists) {
            return res.status(404).json({
                error: "La catégorie n'existe pas"
            });
        }


        // Crée le produit avec le service
        const id = await createProductService({
            name: name.trim(),
            description,
            price: Number(price),
            category_id: Number(category_id),
            available
        });


        // Retourne la réponse
        res.status(201).json({
            message: "Produit créé avec succès",
            id
        });

    } catch (error) {
        // Envoie l'erreur au middleware global
        next(error);
    }
};


// ==================================================
// PUT /api/products/:id
// Modifier un produit
// ==================================================

const updateProduct = async (req, res, next) => {
    try {
        // Récupère l'identifiant depuis l'URL
        const { id } = req.params;

        // Les données ont déjà été validées
        // par validateUpdateProduct
        const {
            name,
            description,
            price,
            category_id,
            available
        } = req.body;


        // Vérifie que la catégorie existe
        const exists = await categoryExists(category_id);

        if (!exists) {
            return res.status(404).json({
                error: "La catégorie n'existe pas"
            });
        }


        // Demande au service de modifier le produit
        const affectedRows = await updateProductService(
            id,
            {
                name: name.trim(),
                description,
                price: Number(price),
                category_id: Number(category_id),
                available
            }
        );


        // Vérifie si le produit existe
        if (affectedRows === 0) {
            return res.status(404).json({
                error: "Produit introuvable"
            });
        }


        // Retourne une confirmation
        res.json({
            message: "Produit modifié avec succès",
            id: Number(id)
        });

    } catch (error) {
        // Envoie l'erreur au middleware global
        next(error);
    }
};

// ==================================================
// DELETE /api/products/:id
// Supprimer un produit
// ==================================================

const deleteProduct = async (req, res, next) => {
    try {
        // Récupère l'identifiant depuis l'URL
        const { id } = req.params;


        // Demande au service de supprimer le produit
        const affectedRows = await deleteProductService(id);


        // Vérifie si le produit existe
        if (affectedRows === 0) {
            return res.status(404).json({
                error: "Produit introuvable"
            });
        }


        // Retourne une confirmation
        res.json({
            message: "Produit supprimé avec succès",
            id: Number(id)
        });

    } catch (error) {
        // Envoie l'erreur au middleware global
        next(error);
    }
};


// ==================================================
// Exporter les fonctions
// ==================================================

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};