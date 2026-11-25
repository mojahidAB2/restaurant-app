const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeAuthBody = (body = {}) => {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    return { name, email, password };
};

const validateRegisterData = (req, res, next) => {
    const { name, email, password } = normalizeAuthBody(req.body);
    req.body = { ...req.body, name, email, password };

    if (!name) {
        return res.status(400).json({ error: "Le nom est obligatoire" });
    }

    if (!email) {
        return res.status(400).json({ error: "L'email est obligatoire" });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "L'email est invalide" });
    }

    if (!password) {
        return res.status(400).json({ error: "Le mot de passe est obligatoire" });
    }

    if (password.length < 8) {
        return res.status(400).json({
            error: "Le mot de passe doit contenir au moins 8 caractères"
        });
    }

    next();
};

const validateLoginData = (req, res, next) => {
    const { email, password } = normalizeAuthBody(req.body);
    req.body = { ...req.body, email, password };

    if (!email) {
        return res.status(400).json({ error: "L'email est obligatoire" });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "L'email est invalide" });
    }

    if (!password) {
        return res.status(400).json({ error: "Le mot de passe est obligatoire" });
    }

    next();
};

const validateRefreshTokenData = (req, res, next) => {
    const refreshToken = typeof req.body?.refreshToken === "string" ? req.body.refreshToken.trim() : "";
    if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token requis" });
    }
    req.body.refreshToken = refreshToken;
    next();
};

module.exports = {
    validateRegisterData,
    validateLoginData,
    validateRefreshTokenData
};
