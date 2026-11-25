const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegisterData = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
            error: "Le nom est obligatoire"
        });
    }

    if (!email || typeof email !== "string" || email.trim() === "") {
        return res.status(400).json({
            error: "L'email est obligatoire"
        });
    }

    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            error: "L'email est invalide"
        });
    }

    if (!password || typeof password !== "string") {
        return res.status(400).json({
            error: "Le mot de passe est obligatoire"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            error: "Le mot de passe doit contenir au moins 8 caractères"
        });
    }

    next();
};

const validateLoginData = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || typeof email !== "string" || email.trim() === "") {
        return res.status(400).json({
            error: "L'email est obligatoire"
        });
    }

    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            error: "L'email est invalide"
        });
    }

    if (!password || typeof password !== "string" || password === "") {
        return res.status(400).json({
            error: "Le mot de passe est obligatoire"
        });
    }

    next();
};

module.exports = {
    validateRegisterData,
    validateLoginData
};