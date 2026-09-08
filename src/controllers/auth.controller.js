const authService = require("../services/auth.service");

const register = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;

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
        const {
            email,
            password
        } = req.body;

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