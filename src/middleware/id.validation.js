// ==================================================
// Validation d'un identifiant
// ==================================================

const validateId = (req, res, next) => {

    // Récupère l'id depuis l'URL
    const { id } = req.params;


    // Vérifie que l'id est un nombre entier positif
    if (
        !id ||
        !/^[1-9]\d*$/.test(id)
    ) {
        return res.status(400).json({
            error: "L'identifiant doit être un nombre entier positif"
        });
    }


    // L'identifiant est valide
    next();
};


// ==================================================
// Exporter le middleware
// ==================================================

module.exports = validateId;