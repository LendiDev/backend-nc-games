const {
  selectReviews,
  selectReviewById,
  updateReview,
  insertReview,
} = require("../models/reviews.model");
const checkIsExistsIn = require("../utils/db/check-is-exists-in-db");

const getReviews = async (req, res, next) => {
  const { category: category_slug, sort_by, order } = req.query;

  try {
    if (category_slug) {
      await checkIsExistsIn("categories", "slug", category_slug, "Category");
    }
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

const postReview = async (req, res, next) => {
  const { body: newReview } = req;

  try {
    if (newReview.category) {
      await checkIsExistsIn(
        "categories",
        "slug",
        newReview.category,
        "Category"
      );
    }
    if (newReview.owner) {
      await checkIsExistsIn("users", "username", newReview.owner, "Owner");
    }
    const review = await insertReview(newReview);

    res.status(200).send({ review });
  } catch (err) {
    next(err);
  }
};

const patchReview = async (req, res, next) => {
  const { review_id } = req.params;
  const patchObject = req.body;

  try {
    await checkIsExistsIn("reviews", "review_id", review_id, "Review");
    const review = await updateReview(review_id, patchObject);

    res.status(200).send({ review });
  } catch (err) {
    next(err);
  }
};

module.exports = { getReviews, getReviewById, postReview, patchReview };
