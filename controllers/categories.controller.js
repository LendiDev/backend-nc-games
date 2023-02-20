const { selectCategories } = require("../models/categories.model");

const getCategories = async (req, res, next) => {
  try {
    const categories = await selectCategories();

    res.status(200).send({ categories });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories };
