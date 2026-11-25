// Importe la connexion à la base de données
const pool = require("../config/database");


const PRODUCT_SORT_COLUMNS = {
    id: "products.id",
    name: "products.name",
    price: "products.price",
    created_at: "products.created_at",
    category: "categories.name",
    available: "products.available"
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
// Récupérer tous les produits
// ==================================================

const findAllProducts = async (query = {}) => {
    const pagination = parsePagination(query);
    const where = [];
    const params = [];

    if (typeof query.q === "string" && query.q.trim()) {
        where.push("products.name LIKE ?");
        params.push(`%${query.q.trim()}%`);
    }

    if (query.category_id !== undefined && query.category_id !== "") {
        const categoryId = Number.parseInt(query.category_id, 10);
        if (Number.isInteger(categoryId) && categoryId > 0) {
            where.push("products.category_id = ?");
            params.push(categoryId);
        }
    }

    if (query.available !== undefined && query.available !== "") {
        const normalized = String(query.available).toLowerCase();
        if (normalized === "true" || normalized === "1") {
            where.push("products.available = ?");
            params.push(1);
        } else if (normalized === "false" || normalized === "0") {
            where.push("products.available = ?");
            params.push(0);
        }
    }

    const sortKey = PRODUCT_SORT_COLUMNS[query.sort] ? query.sort : "id";
    const sortColumn = PRODUCT_SORT_COLUMNS[sortKey];
    const sortOrder = String(query.order).toLowerCase() === "desc" ? "DESC" : "ASC";
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const baseSelect = `
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
    `;

    if (!pagination) {
        const [products] = await pool.query(
            `${baseSelect} ${whereSql} ORDER BY ${sortColumn} ${sortOrder}`,
            params
        );
        return products;
    }

    const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total FROM products JOIN categories ON products.category_id = categories.id ${whereSql}`,
        params
    );

    const [products] = await pool.query(
        `${baseSelect} ${whereSql} ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`,
        [...params, pagination.limit, pagination.offset]
    );

    return {
        data: products,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / pagination.limit))
        }
    };
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