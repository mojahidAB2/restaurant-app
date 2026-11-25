-- ============================================================
-- BASE DE DONNÉES DU RESTAURANT
-- ============================================================
USE restaurant_db;
-- ============================================================
-- TABLE : categories
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (

    -- Identifiant unique
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Nom de la catégorie
    name VARCHAR(100) NOT NULL,

    -- Date de création
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Nom de catégorie unique
    UNIQUE KEY uq_categories_name (name)

);


-- ============================================================
-- TABLE : products
-- ============================================================

CREATE TABLE IF NOT EXISTS products (

    -- Identifiant unique
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Nom du produit
    name VARCHAR(150) NOT NULL,

    -- Description du produit
    description TEXT,

    -- Prix du produit
    price DECIMAL(10,2) NOT NULL,

    -- Catégorie du produit
    category_id INT NOT NULL,

    -- Disponibilité
    available BOOLEAN DEFAULT TRUE,

    -- Date de création
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Relation avec categories
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE : refresh_tokens
-- Refresh tokens pour rotation/révocation
-- ============================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    replaced_by_token_hash CHAR(64) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_refresh_tokens_hash (token_hash),
    INDEX idx_refresh_tokens_user_id (user_id),
    INDEX idx_refresh_tokens_expires_at (expires_at)
);

-- ============================================================
-- TABLE : schema_migrations
-- Suivi des migrations SQL appliquées
-- ============================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrations déjà incluses dans le schéma complet
INSERT INTO schema_migrations (filename)
SELECT '002_add_constraints.sql'
WHERE NOT EXISTS (
    SELECT 1 FROM schema_migrations WHERE filename = '002_add_constraints.sql'
);

INSERT INTO schema_migrations (filename)
SELECT '003_create_refresh_tokens.sql'
WHERE NOT EXISTS (
    SELECT 1 FROM schema_migrations WHERE filename = '003_create_refresh_tokens.sql'
);
