// ==================================================
// Validation commune d'un produit
// ==================================================

const validateProductData = (req, res, next) => {

    // Récupère les données envoyées par le client
    const {
        name,
        price,
        category_id
    } = req.body;


    // --------------------------------------------------
    // Vérifier le nom
    // --------------------------------------------------

    if (
        !name ||
        typeof name !== "string" ||
        name.trim() === ""
    ) {
        return res.status(400).json({
            error: "Le nom du produit est obligatoire"
        });
    }


    // --------------------------------------------------
    // Vérifier le prix
    // --------------------------------------------------

    if (
        price === undefined ||
        price === null ||
        price === "" ||
        isNaN(price) ||
        Number(price) <= 0
    ) {
        return res.status(400).json({
            error: "Le prix doit être un nombre supérieur à 0"
        });
    }


    // --------------------------------------------------
    // Vérifier category_id
    // --------------------------------------------------

    if (!Number.isInteger(Number(category_id))) {
        return res.status(400).json({
            error: "category_id doit être un nombre entier"
        });
    }


    // --------------------------------------------------
    // Toutes les données sont correctes
    // --------------------------------------------------

    next();
};


// ==================================================
// Exporter le middleware
// ==================================================

module.exports = validateProductData;