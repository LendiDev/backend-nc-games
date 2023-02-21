const db = require("../db/connection");
const CustomError = require("../utils/custom-error");

const selectCommentsByReviewId = async (review_id) => {
  const { rows: comments } = await db.query(
    `SELECT * FROM comments 
     WHERE review_id = $1 
     ORDER BY created_at DESC;`,
    [review_id]
  );

  return comments;
};

const insertCommentByReviewId = async (review_id, comment) => {
  const { username: author, body } = comment;

  if (body !== undefined && body.length === 0) throw new CustomError(400, "Comment cannot be empty");

  const { rows: result } = await db.query(
    `
    INSERT INTO comments (review_id, author, body)
    VALUES ($1, $2, $3)
    RETURNING *;`,
    [review_id, author, body]
  );

  return result[0];
};

module.exports = { selectCommentsByReviewId, insertCommentByReviewId };
