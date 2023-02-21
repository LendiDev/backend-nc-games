const db = require("../db/connection");

const selectCommentsByReviewId = async (review_id) => {
  const { rows: comments, rowCount: commentsCount } = await db.query(
    `SELECT * FROM comments 
     WHERE review_id = $1 
     ORDER BY created_at DESC;`,
    [review_id]
  );

  return comments;
};

module.exports = { selectCommentsByReviewId };
