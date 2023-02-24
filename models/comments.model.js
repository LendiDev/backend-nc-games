const db = require("../db/connection");
const CustomError = require("../utils/custom-error");

const selectCommentsByReviewId = async (review_id) => {
  const { rows: comments } = await db.query(
    `
     SELECT * FROM comments 
     WHERE review_id = $1 
     ORDER BY created_at DESC;`,
    [review_id]
  );

  return comments;
};

const insertCommentByReviewId = async (review_id, comment) => {
  const { username: author, body } = comment;

  if (body !== undefined && body.length === 0)
    throw new CustomError(400, "Comment cannot be empty");

  const {
    rows: [insertedComment],
  } = await db.query(
    `
    INSERT INTO comments (review_id, author, body)
    VALUES ($1, $2, $3)
    RETURNING *;`,
    [review_id, author, body]
  );

  return insertedComment;
};

const updateComment = async (comment_id, patchObject) => {
  const { inc_votes } = patchObject;

  if ((inc_votes && inc_votes > 1) || inc_votes < -1 || inc_votes === 0) {
    throw new CustomError(400, "Votes only permitted to be changed by 1 or -1");
  }

  const {
    rows: [updatedComment],
  } = await db.query(
    `
    UPDATE comments 
    SET votes = votes + $2
    WHERE comment_id = $1
    RETURNING *`,
    [comment_id, inc_votes]
  );

  return updatedComment;
};

const deleteCommentFromCommentsById = async (comment_id) => {
  await db.query(
    `
    DELETE FROM comments 
    WHERE comment_id = $1`,
    [comment_id]
  );
};

module.exports = {
  selectCommentsByReviewId,
  insertCommentByReviewId,
  deleteCommentFromCommentsById,
  updateComment,
};
