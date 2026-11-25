require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("../config/database");

async function seedAdmin() {
    const name = process.env.ADMIN_NAME || "Admin";
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.error("ADMIN_EMAIL et ADMIN_PASSWORD sont requis.");
        process.exit(1);
    }

    if (password.length < 8) {
        console.error("ADMIN_PASSWORD doit contenir au moins 8 caractères.");
        process.exit(1);
    }

    try {
        const [existing] = await pool.query(
            "SELECT id, role FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            const user = existing[0];
            if (user.role !== "admin") {
                await pool.query("UPDATE users SET role = 'admin' WHERE id = ?", [user.id]);
                console.log(`Utilisateur existant promu admin: ${email}`);
            } else {
                console.log(`Admin déjà présent: ${email}`);
            }
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES (?, ?, ?, 'admin')`,
            [name, email, passwordHash]
        );
        console.log(`Admin créé: ${email}`);
    } finally {
        await pool.end();
    }
}

seedAdmin().catch((error) => {
    console.error("Erreur seed admin:", error.message);
    process.exit(1);
});
