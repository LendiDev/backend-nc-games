const {
  selectCommentsByReviewId,
  insertCommentByReviewId,
  deleteCommentFromCommentsById,
  updateComment,
} = require("../models/comments.model");
const checkIsExistsIn = require("../utils/db/check-is-exists-in-db");

const getCommentsByReviewId = async (req, res, next) => {
  const { review_id } = req.params;
  try {
    await checkIsExistsIn("reviews", "review_id", review_id, "Review");
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
    await checkIsExistsIn("reviews", "review_id", review_id, "Review");
    const comment = await insertCommentByReviewId(review_id, commentToPost);

    res.status(201).send({ comment });
  } catch (err) {
    next(err);
  }
};

const patchComment = async (req, res, next) => {
  const { comment_id } = req.params;
  const patchObject = req.body;

  try {
    await checkIsExistsIn("comments", "comment_id", comment_id, "Comment");
    const comment = await updateComment(comment_id, patchObject);

    res.status(200).send({ comment });
  } catch (err) {
    next(err);
  }
};

const deleteCommentById = async (req, res, next) => {
  const { comment_id } = req.params;

  try {
    await checkIsExistsIn("comments", "comment_id", comment_id, "Comment");
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
  patchComment,
};
