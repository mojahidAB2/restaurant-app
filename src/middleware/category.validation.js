// ==================================================
// Validation des données d'une catégorie
// ==================================================

const validateCategoryData = (req, res, next) => {

    // Récupère le nom envoyé par le client
    const { name } = req.body;


    // --------------------------------------------------
    // Vérifier le nom
    // --------------------------------------------------

    if (
        !name ||
        typeof name !== "string" ||
        name.trim() === ""
    ) {
        return res.status(400).json({
            error: "Le nom de la catégorie est obligatoire"
        });
    }


    // --------------------------------------------------
    // Tout est correct
    // --------------------------------------------------

    next();
};


// ==================================================
// Exporter le middleware
// ==================================================

module.exports = validateCategoryData;