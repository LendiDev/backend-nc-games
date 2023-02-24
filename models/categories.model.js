const db = require("../db/connection");

const selectCategories = async () => {
  const { rows: categories } = await db.query(`SELECT * FROM categories;`);
  return categories;
};

module.exports = { selectCategories };
