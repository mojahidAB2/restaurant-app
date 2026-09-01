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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

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

);-- ============================================================
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

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

);