// Importe la connexion à la base de données
const pool = require("../config/database");


// ==================================================
// Récupérer tous les produits
// ==================================================

const findAllProducts = async () => {

    const [products] = await pool.query(`
        SELECT
            products.id,
            products.name,
            products.description,
            products.price,
            categories.name AS category,
            products.available,
            products.created_at
        FROM products
        JOIN categories
            ON products.category_id = categories.id
        ORDER BY products.id
    `);

    return products;
};


// ==================================================
// Récupérer un produit par son ID
// ==================================================

const findProductById = async (id) => {

    const [products] = await pool.query(`
        SELECT
            products.id,
            products.name,
            products.description,
            products.price,
            categories.name AS category,
            products.available,
            products.created_at
        FROM products
        JOIN categories
            ON products.category_id = categories.id
        WHERE products.id = ?
    `, [id]);

    // Retourne le premier produit trouvé
    // ou undefined s'il n'existe pas
    return products[0];
};


// ==================================================
// Vérifier si une catégorie existe
// ==================================================

const categoryExists = async (categoryId) => {

    const [categories] = await pool.query(
        `
        SELECT id
        FROM categories
        WHERE id = ?
        `,
        [categoryId]
    );

    return categories.length > 0;
};


// ==================================================
// Créer un nouveau produit
// ==================================================

const createProduct = async ({
    name,
    description,
    price,
    category_id,
    available
}) => {

    const [result] = await pool.query(
        `
        INSERT INTO products
            (
                name,
                description,
                price,
                category_id,
                available
            )
        VALUES
            (?, ?, ?, ?, ?)
        `,
        [
            name,
            description || null,
            price,
            category_id,
            available ?? 1
        ]
    );

    // Retourne l'ID du nouveau produit
    return result.insertId;
};


// ==================================================
// Modifier un produit
// ==================================================

const updateProduct = async (
    id,
    {
        name,
        description,
        price,
        category_id,
        available
    }
) => {

    const [result] = await pool.query(
        `
        UPDATE products
        SET
            name = ?,
            description = ?,
            price = ?,
            category_id = ?,
            available = ?
        WHERE id = ?
        `,
        [
            name,
            description || null,
            price,
            category_id,
            available ?? 1,
            id
        ]
    );

    // Retourne le nombre de lignes modifiées
    return result.affectedRows;
};


// ==================================================
// Supprimer un produit
// ==================================================

const deleteProduct = async (id) => {

    const [result] = await pool.query(
        `
        DELETE FROM products
        WHERE id = ?
        `,
        [id]
    );

    // Retourne le nombre de lignes supprimées
    return result.affectedRows;
};


// ==================================================
// Exporter les fonctions
// ==================================================

module.exports = {
    findAllProducts,
    findProductById,
    categoryExists,
    createProduct,
    updateProduct,
    deleteProduct
};