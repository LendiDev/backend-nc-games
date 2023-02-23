const { selectReviewById } = require("../models/reviews.model");
const {
  selectCommentsByReviewId,
  insertCommentByReviewId,
  selectCommentById,
  deleteCommentFromCommentsById,
} = require("../models/comments.model");

const getCommentsByReviewId = async (req, res, next) => {
  const { review_id } = req.params;
  try {
    await selectReviewById(review_id);
    const comments = await selectCommentsByReviewId(review_id);

    res.status(200).send({ comments });
  } catch (err) {
    next(err);
  }
};

const postCommentByReviewId = async (req, res, next) => {
  const { review_id } = req.params;
  const commentToPost = req.body;

  try {
    const comment = await insertCommentByReviewId(review_id, commentToPost);

    res.status(201).send({ comment });
  } catch (err) {
    next(err);
  }
};

const deleteCommentById = async (req, res, next) => {
  const { comment_id } = req.params;

  try {
    await selectCommentById(comment_id);
    await deleteCommentFromCommentsById(comment_id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCommentsByReviewId,
  postCommentByReviewId,
  deleteCommentById,
};
