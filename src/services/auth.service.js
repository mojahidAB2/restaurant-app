const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../config/database");

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

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};

module.exports = {
    register,
    login
};