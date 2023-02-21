const {
  selectReviews,
  selectReviewById,
  updateReview,
} = require("../models/reviews.model");

const getReviews = async (req, res, next) => {
  try {
    const reviews = await selectReviews();

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

const patchReview = async (req, res, next) => {
  const { review_id } = req.params;
  const patchObject = req.body;

  try {
    await selectReviewById(review_id);
    const review = await updateReview(review_id, patchObject);

    res.status(200).send({ review });
  } catch (err) {
    next(err);
  }
};

module.exports = { getReviews, getReviewById, patchReview };
