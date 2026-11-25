-- Migration 002: contraintes DB
-- À appliquer sur une base existante déjà initialisée avec l'ancien schéma.

ALTER TABLE categories
    ADD CONSTRAINT uq_categories_name UNIQUE (name);

ALTER TABLE products
    DROP FOREIGN KEY fk_products_category;

ALTER TABLE products
    ADD CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT;
