const db = require("../db/connection");
const CustomError = require("../utils/custom-error");

const selectReviews = async () => {
  const { rows, rowCount } = await db.query(`
      SELECT 
          owner, title, review_id, category, review_img_url, review.created_at, review.votes, designer, CAST(COUNT(comments.review_id) as INT) as comment_count 
      FROM 
          reviews review
      LEFT JOIN comments USING (review_id)
      GROUP BY 
          comments.review_id, review.review_id, review.owner, review.title, review.category, review.review_img_url, review.created_at, review.votes, review.designer
      ORDER BY created_at DESC;
  `);

  return rows;
};

const selectReviewById = async (review_id) => {
  const { rows, rowCount } = await db.query(
    `
      SELECT * FROM reviews 
      WHERE review_id = $1;`,
    [review_id]
  );

  if (rowCount === 0) throw new CustomError(404, "Review not found");

  return rows[0];
};

const updateReview = async (review_id, patchObject) => {
  const { inc_votes } = patchObject;

  const { rows, rowCount } = await db.query(
    `
      UPDATE reviews 
      SET votes = votes + $2
      WHERE review_id = $1
      RETURNING *`,
    [review_id, inc_votes]
  );

  if (rowCount === 0) throw new CustomError(400, "Bad request");

  return rows[0];
};

module.exports = { selectReviews, selectReviewById, updateReview };
