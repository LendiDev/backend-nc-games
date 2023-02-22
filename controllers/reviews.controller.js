const { selectCategoryBySlug } = require("../models/categories.model");
const { selectReviews, selectReviewById } = require("../models/reviews.model");

const getReviews = async (req, res, next) => {
  const { category: category_slug, sort_by, order } = req.query;
  try {
    if (category_slug) await selectCategoryBySlug(category_slug);
    const reviews = await selectReviews(category_slug, sort_by, order);

    res.status(200).send({ reviews });
  } catch (err) {
    next(err);
  }
};

const getReviewById = async (req, res, next) => {
  const { review_id } = req.params;

  try {
    const review = await selectReviewById(review_id);

    res.status(200).send({ review });
  } catch (err) {
    next(err);
  }
};

module.exports = { getReviews, getReviewById };
