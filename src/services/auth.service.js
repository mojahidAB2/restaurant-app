const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const pool = require("../config/database");

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_TOKEN_DAYS = Number.parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS, 10) || 7;

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const generateAccessToken = (user) => jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
);

const generateRefreshToken = () => crypto.randomBytes(48).toString("hex");

const getRefreshExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + REFRESH_TOKEN_DAYS);
    return date;
};

const storeRefreshToken = async (userId, refreshToken) => {
    const tokenHash = hashToken(refreshToken);
    const expiresAt = getRefreshExpiryDate();
    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES (?, ?, ?)`,
        [userId, tokenHash, expiresAt]
    );
};

const issueAuthTokens = async (user) => {
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    await storeRefreshToken(user.id, refreshToken);
    return { token, refreshToken };
};

const register = async (name, email, password) => {
    const [existingUsers] = await pool.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
    );

    if (existingUsers.length > 0) {
        const error = new Error("Cet email est déjà utilisé");
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES (?, ?, ?)`,
        [name, email, passwordHash]
    );

    return {
        id: result.insertId,
        name,
        email,
        role: "staff"
    };
};

const login = async (email, password) => {
    const [users] = await pool.query(
        `SELECT id, name, email, password_hash, role
         FROM users
         WHERE email = ?`,
        [email]
    );

    if (users.length === 0) {
        const error = new Error("Email ou mot de passe incorrect");
        error.statusCode = 401;
        throw error;
    }

    const user = users[0];

    const passwordValid = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordValid) {
        const error = new Error("Email ou mot de passe incorrect");
        error.statusCode = 401;
        throw error;
    }

    const tokens = await issueAuthTokens(user);

    return {
        ...tokens,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};

const refresh = async (refreshToken) => {
    if (!refreshToken || typeof refreshToken !== "string") {
        const error = new Error("Refresh token invalide");
        error.statusCode = 401;
        throw error;
    }

    const tokenHash = hashToken(refreshToken);
    const [rows] = await pool.query(
        `SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked_at, u.id AS uid, u.name, u.email, u.role
         FROM refresh_tokens rt
         JOIN users u ON u.id = rt.user_id
         WHERE rt.token_hash = ?`,
        [tokenHash]
    );

    if (rows.length === 0) {
        const error = new Error("Refresh token invalide");
        error.statusCode = 401;
        throw error;
    }

    const record = rows[0];
    const expired = new Date(record.expires_at).getTime() <= Date.now();
    if (record.revoked_at || expired) {
        const error = new Error("Refresh token invalide ou expiré");
        error.statusCode = 401;
        throw error;
    }

    const user = { id: record.uid, name: record.name, email: record.email, role: record.role };
    const newTokens = await issueAuthTokens(user);
    const newHash = hashToken(newTokens.refreshToken);

    await pool.query(
        `UPDATE refresh_tokens
         SET revoked_at = CURRENT_TIMESTAMP, replaced_by_token_hash = ?
         WHERE id = ? AND revoked_at IS NULL`,
        [newHash, record.id]
    );

    return { ...newTokens, user };
};

const logout = async (refreshToken) => {
    if (!refreshToken || typeof refreshToken !== "string") {
        const error = new Error("Refresh token invalide");
        error.statusCode = 400;
        throw error;
    }

    const tokenHash = hashToken(refreshToken);
    await pool.query(
        `UPDATE refresh_tokens
         SET revoked_at = CURRENT_TIMESTAMP
         WHERE token_hash = ? AND revoked_at IS NULL`,
        [tokenHash]
    );
};

module.exports = {
    register,
    login,
    refresh,
    logout
};
