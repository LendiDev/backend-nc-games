const {
  selectReviews,
  selectCommentsByReviewId,
  selectReviewById,
} = require("../models/reviews.model");

const getReviews = async (req, res, next) => {
  try {
    const reviews = await selectReviews();

    res.status(200).send({ reviews });
  } catch (err) {
    next(err);
  }
};

const getCommentsByReviewId = async (req, res, next) => {
  const { review_id } = req.params;

  try {
    const comments = await selectCommentsByReviewId(review_id);

    res.status(200).send({ comments });
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

module.exports = { getReviews, getCommentsByReviewId, getReviewById };
