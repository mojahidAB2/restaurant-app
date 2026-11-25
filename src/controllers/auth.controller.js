const authService = require("../services/auth.service");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const register = async (req, res, next) => {
    try {
        const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
        const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const password = typeof req.body?.password === "string" ? req.body.password : "";

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Nom, email et mot de passe requis"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: "Format d'email invalide"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: "Le mot de passe doit contenir au moins 8 caractères"
            });
        }

        const user = await authService.register(
            name,
            email,
            password
        );

        res.status(201).json({
            message: "Utilisateur créé avec succès",
            user
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const password = typeof req.body?.password === "string" ? req.body.password : "";

        if (!email || !password) {
            return res.status(400).json({
                error: "Email et mot de passe requis"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: "Format d'email invalide"
            });
        }

        const result = await authService.login(
            email,
            password
        );

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login
};