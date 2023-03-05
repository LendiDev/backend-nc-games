const db = require("../db/connection");
const CustomError = require("../utils/custom-error");
const pagination = require("../utils/pagination");

const selectCommentsByReviewId = async (review_id, page, limit) => {
  if ((page && isNaN(page)) || page < 1) {
    throw new CustomError(
      400,
      `Invalid query value of 'p' parameter. Positive number is only permitted`
    );
  }
  if ((limit && isNaN(limit)) || limit < 1) {
    throw new CustomError(
      400,
      `Invalid query value of 'limit' parameter. Positive number is only permitted`
    );
  }

  const { offset, limit: limit_rows } = pagination(page, limit);

  const {
    rows: [{ comments, total_count }],
  } = await db.query(
    `SELECT (SELECT CAST(COUNT(*) AS INT) FROM comments WHERE review_id = $1) as total_count, (SELECT json_agg(comments.*) AS comments FROM (
          SELECT comments.* FROM comments 
          WHERE review_id = $1
          ORDER BY created_at DESC
          OFFSET ${offset}
          LIMIT ${limit_rows}
  ) AS comments);`,
    [review_id]
  );

  const max_pages = Math.ceil(total_count / limit_rows);

  return { total_count, max_pages, comments: comments || [] };
};

const insertCommentByReviewId = async (review_id, comment) => {
  const { username: author, body } = comment;

  if (body !== undefined && body.length === 0)
    throw new CustomError(400, "Comment body cannot be empty");

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
