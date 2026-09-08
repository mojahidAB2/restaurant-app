const validateRegisterData = (req, res, next) => {
    const {
        name,
        email,
        password
    } = req.body;

    // Vérifier le nom
    if (
        !name ||
        typeof name !== "string" ||
        name.trim() === ""
    ) {
        return res.status(400).json({
            error: "Le nom est obligatoire"
        });
    }

    // Vérifier l'email
    if (
        !email ||
        typeof email !== "string" ||
        email.trim() === ""
    ) {
        return res.status(400).json({
            error: "L'email est obligatoire"
        });
    }

    // Vérifier le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            error: "L'email est invalide"
        });
    }

    // Vérifier le mot de passe
    if (
        !password ||
        typeof password !== "string"
    ) {
        return res.status(400).json({
            error: "Le mot de passe est obligatoire"
        });
    }

    // Minimum 8 caractères
    if (password.length < 8) {
        return res.status(400).json({
            error: "Le mot de passe doit contenir au moins 8 caractères"
        });
    }

    next();
};

module.exports = validateRegisterData;