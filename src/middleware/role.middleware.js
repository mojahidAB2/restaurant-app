const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                error: "Rôle utilisateur introuvable"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Accès interdit pour ce rôle"
            });
        }

        next();
    };
};

module.exports = authorizeRoles;