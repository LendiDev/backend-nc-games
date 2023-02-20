const db = require("../db/connection");
const CustomError = require("../utils/custom-error");

const selectCategories = async () => {
  const { rows, rowCount } = await db.query(`SELECT * FROM categories;`);

  if (rowCount === 0) throw new CustomError(404, "No categories found");

  return rows;
};

module.exports = { selectCategories };
