// Importe la connexion à la base de données
const pool = require("../config/database");


const CATEGORY_SORT_COLUMNS = {
    id: "id",
    name: "name",
    created_at: "created_at"
};

const parsePagination = (query = {}) => {
    const hasPage = query.page !== undefined;
    const hasLimit = query.limit !== undefined;
    if (!hasPage && !hasLimit) return null;

    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
    return { page, limit, offset: (page - 1) * limit };
};

// ==================================================
// Récupérer toutes les catégories
// ==================================================

const findAllCategories = async (query = {}) => {
    const pagination = parsePagination(query);
    const where = [];
    const params = [];

    if (typeof query.q === "string" && query.q.trim()) {
        where.push("name LIKE ?");
        params.push(`%${query.q.trim()}%`);
    }

    const sortKey = CATEGORY_SORT_COLUMNS[query.sort] ? query.sort : "id";
    const sortColumn = CATEGORY_SORT_COLUMNS[sortKey];
    const sortOrder = String(query.order).toLowerCase() === "desc" ? "DESC" : "ASC";
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    if (!pagination) {
        const [categories] = await pool.query(
            `
            SELECT id, name, created_at
            FROM categories
            ${whereSql}
            ORDER BY ${sortColumn} ${sortOrder}
            `,
            params
        );
        return categories;
    }

    const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total FROM categories ${whereSql}`,
        params
    );

    const [categories] = await pool.query(
        `
        SELECT id, name, created_at
        FROM categories
        ${whereSql}
        ORDER BY ${sortColumn} ${sortOrder}
        LIMIT ? OFFSET ?
        `,
        [...params, pagination.limit, pagination.offset]
    );

    return {
        data: categories,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / pagination.limit))
        }
    };
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