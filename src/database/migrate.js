require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function ensureMigrationsTable(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function getAppliedMigrations(connection) {
    const [rows] = await connection.query(
        "SELECT filename FROM schema_migrations ORDER BY filename"
    );
    return new Set(rows.map((row) => row.filename));
}

function getMigrationFiles() {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        return [];
    }

    return fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((file) => file.endsWith(".sql"))
        .sort();
}

const IDEMPOTENT_ERROR_CODES = new Set([
    "ER_DUP_FIELDNAME",
    "ER_DUP_KEYNAME",
    "ER_FK_DUP_NAME",
    "ER_CANT_DROP_FIELD_OR_KEY",
    "ER_TABLE_EXISTS_ERROR"
]);

async function applyMigration(connection, filename) {
    const filePath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(filePath, "utf8").trim();

    if (!sql) {
        console.log(`Skip empty migration: ${filename}`);
        return;
    }

    try {
        await connection.query(sql);
    } catch (error) {
        if (IDEMPOTENT_ERROR_CODES.has(error.code)) {
            console.warn(`Migration already effectively applied (${error.code}): ${filename}`);
        } else {
            throw error;
        }
    }

    await connection.query(
        "INSERT INTO schema_migrations (filename) VALUES (?) ON DUPLICATE KEY UPDATE filename = VALUES(filename)",
        [filename]
    );
    console.log(`Applied: ${filename}`);
}

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        await ensureMigrationsTable(connection);
        const applied = await getAppliedMigrations(connection);
        const files = getMigrationFiles();

        let appliedCount = 0;
        for (const filename of files) {
            if (applied.has(filename)) {
                console.log(`Already applied: ${filename}`);
                continue;
            }

            await applyMigration(connection, filename);
            appliedCount += 1;
        }

        if (appliedCount === 0) {
            console.log("No pending migrations.");
        } else {
            console.log(`Migrations complete: ${appliedCount} applied.`);
        }
    } finally {
        await connection.end();
    }
}

migrate().catch((error) => {
    console.error("Migration failed:", error.message);
    process.exit(1);
});
