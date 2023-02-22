const { selectCategories, selectCategoryBySlug } = require("../models/categories.model");

const getCategories = async (req, res, next) => {
  try {
    const categories = await selectCategories();

    res.status(200).send({ categories });
  } catch (err) {
    next(err);
  }
};

const getCategoryBySlug = async (req, res, next) => {
  const { category_slug } = req.params;

  try {
    const category = await selectCategoryBySlug(category_slug);

    res.status(200).send({ category });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories, getCategoryBySlug };
