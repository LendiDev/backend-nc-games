const db = require("../db/connection");
const CustomError = require("../utils/custom-error");

const selectCategories = async () => {
  const { rows, rowCount } = await db.query(`SELECT * FROM categories;`);

  if (rowCount === 0) throw new CustomError(404, "No categories found");

  return rows;
};

const selectCategoryBySlug = async (category_slug) => {
  const { rows, rowCount } = await db.query(
    `SELECT * FROM categories WHERE slug = $1`,
    [category_slug]
  );

  if (rowCount === 0) throw new CustomError(404, "Category not found");

  return rows[0];
};

module.exports = { selectCategories, selectCategoryBySlug };
