// Importe la connexion à la base de données
const pool = require("../config/database");


// ==================================================
// Récupérer toutes les catégories
// ==================================================

const findAllCategories = async () => {

    const [categories] = await pool.query(`
        SELECT
            id,
            name,
            created_at
        FROM categories
        ORDER BY id
    `);

    // Retourne toutes les catégories
    return categories;
};


// ==================================================
// Récupérer une catégorie par son ID
// ==================================================

const findCategoryById = async (id) => {

    const [categories] = await pool.query(`
        SELECT
            id,
            name,
            created_at
        FROM categories
        WHERE id = ?
    `, [id]);

    // Retourne la première catégorie trouvée
    // ou undefined si elle n'existe pas
    return categories[0];
};


// ==================================================
// Vérifier si une catégorie existe
// ==================================================

const categoryExists = async (id) => {

    const [categories] = await pool.query(
        `
        SELECT id
        FROM categories
        WHERE id = ?
        `,
        [id]
    );

    // true si la catégorie existe
    // false sinon
    return categories.length > 0;
};


// ==================================================
// Vérifier si le nom d'une catégorie existe déjà
// ==================================================

const categoryNameExists = async (
    name,
    excludeId = null
) => {

    let query = `
        SELECT id
        FROM categories
        WHERE name = ?
    `;

    const params = [name];


    // Lors d'une modification,
    // on ignore la catégorie actuellement modifiée
    if (excludeId !== null) {

        query += " AND id != ?";

        params.push(excludeId);
    }


    const [categories] = await pool.query(
        query,
        params
    );


    // true si le nom existe déjà
    // false sinon
    return categories.length > 0;
};


// ==================================================
// Créer une catégorie
// ==================================================

const createCategory = async (name) => {

    const [result] = await pool.query(
        `
        INSERT INTO categories (name)
        VALUES (?)
        `,
        [name]
    );


    // Retourne l'ID de la catégorie créée
    return result.insertId;
};


// ==================================================
// Modifier une catégorie
// ==================================================

const updateCategory = async (id, name) => {

    const [result] = await pool.query(
        `
        UPDATE categories
        SET name = ?
        WHERE id = ?
        `,
        [name, id]
    );


    // Retourne le nombre de lignes modifiées
    return result.affectedRows;
};


// ==================================================
// Vérifier si une catégorie contient des produits
// ==================================================

const categoryHasProducts = async (categoryId) => {

    const [products] = await pool.query(
        `
        SELECT id
        FROM products
        WHERE category_id = ?
        LIMIT 1
        `,
        [categoryId]
    );


    // true si au moins un produit existe
    // dans cette catégorie
    return products.length > 0;
};


// ==================================================
// Supprimer une catégorie
// ==================================================

const deleteCategory = async (id) => {

    const [result] = await pool.query(
        `
        DELETE FROM categories
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
    findAllCategories,
    findCategoryById,
    categoryExists,
    categoryNameExists,
    createCategory,
    updateCategory,
    categoryHasProducts,
    deleteCategory
};