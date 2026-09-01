// Importe les fonctions du service des catégories
const {
    findAllCategories,
    findCategoryById,
    categoryExists,
    categoryNameExists,
    createCategory: createCategoryService,
    updateCategory: updateCategoryService,
    categoryHasProducts,
    deleteCategory: deleteCategoryService
} = require("../services/categories.service");


// ==================================================
// GET /api/categories
// Récupérer toutes les catégories
// ==================================================

const getAllCategories = async (req, res, next) => {
    try {
        // Demande au service de récupérer toutes les catégories
        const categories = await findAllCategories();

        // Retourne les catégories au client
        res.json(categories);

    } catch (error) {
        // Envoie l'erreur au middleware global
        next(error);
    }
};


// ==================================================
// GET /api/categories/:id
// Récupérer une catégorie
// ==================================================

const getCategoryById = async (req, res, next) => {
    try {
        // Récupère l'identifiant depuis l'URL
        const { id } = req.params;

        // Demande au service de rechercher la catégorie
        const category = await findCategoryById(id);

        // Vérifie si la catégorie existe
        if (!category) {
            return res.status(404).json({
                error: "Catégorie introuvable"
            });
        }

        // Retourne la catégorie
        res.json(category);

    } catch (error) {
        // Envoie l'erreur au middleware global
        next(error);
    }
};


// ==================================================
// POST /api/categories
// Créer une catégorie
// ==================================================

const createCategory = async (req, res, next) => {
    try {
        // Le nom a déjà été validé par
        // validateCreateCategory
        const { name } = req.body;

        // Nettoie le nom
        const cleanName = name.trim();


        // --------------------------------------------------
        // Vérifier si le nom existe déjà
        // --------------------------------------------------

        const exists = await categoryNameExists(cleanName);

        if (exists) {
            return res.status(409).json({
                error: "Cette catégorie existe déjà"
            });
        }


        // --------------------------------------------------
        // Créer la catégorie avec le service
        // --------------------------------------------------

        const id = await createCategoryService(cleanName);


        // --------------------------------------------------
        // Retourner la réponse
        // --------------------------------------------------

        res.status(201).json({
            message: "Catégorie créée avec succès",
            id
        });

    } catch (error) {
        // Envoie l'erreur au middleware global
        next(error);
    }
};


// ==================================================
// PUT /api/categories/:id
// Modifier une catégorie
// ==================================================

const updateCategory = async (req, res, next) => {
    try {
        // Récupère l'identifiant depuis l'URL
        const { id } = req.params;

        // Le nom a déjà été validé par
        // validateUpdateCategory
        const { name } = req.body;

        // Nettoie le nom
        const cleanName = name.trim();


        // --------------------------------------------------
        // Vérifier que la catégorie existe
        // --------------------------------------------------

        const exists = await categoryExists(id);

        if (!exists) {
            return res.status(404).json({
                error: "Catégorie introuvable"
            });
        }


        // --------------------------------------------------
        // Vérifier que le nouveau nom n'existe pas
        // --------------------------------------------------

        const nameExists = await categoryNameExists(
            cleanName,
            id
        );

        if (nameExists) {
            return res.status(409).json({
                error: "Cette catégorie existe déjà"
            });
        }


        // --------------------------------------------------
        // Modifier la catégorie avec le service
        // --------------------------------------------------

        await updateCategoryService(
            id,
            cleanName
        );


        // --------------------------------------------------
        // Retourner la réponse
        // --------------------------------------------------

        res.json({
            message: "Catégorie modifiée avec succès",
            id: Number(id)
        });

    } catch (error) {
        // Envoie l'erreur au middleware global
        next(error);
    }
};


// ==================================================
// DELETE /api/categories/:id
// Supprimer une catégorie
// ==================================================

const deleteCategory = async (req, res, next) => {
    try {
        // Récupère l'identifiant depuis l'URL
        const { id } = req.params;


        // --------------------------------------------------
        // Vérifier que la catégorie existe
        // --------------------------------------------------

        const exists = await categoryExists(id);

        if (!exists) {
            return res.status(404).json({
                error: "Catégorie introuvable"
            });
        }


        // --------------------------------------------------
        // Vérifier si la catégorie contient des produits
        // --------------------------------------------------

        const hasProducts = await categoryHasProducts(id);

        if (hasProducts) {
            return res.status(409).json({
                error:
                    "Impossible de supprimer cette catégorie car elle contient des produits"
            });
        }


        // --------------------------------------------------
        // Supprimer la catégorie avec le service
        // --------------------------------------------------

        await deleteCategoryService(id);


        // --------------------------------------------------
        // Retourner une confirmation
        // --------------------------------------------------

        res.json({
            message: "Catégorie supprimée avec succès",
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
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};