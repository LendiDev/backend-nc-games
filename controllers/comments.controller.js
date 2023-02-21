const { selectReviewById } = require("../models/reviews.model");
const { selectCommentsByReviewId } = require("../models/comments.model");

const getCommentsByReviewId = async (req, res, next) => {
  const { review_id } = req.params;
  console.log(review_id);
  try {
    await selectReviewById(review_id);
    const comments = await selectCommentsByReviewId(review_id);

    res.status(200).send({ comments });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCommentsByReviewId };
