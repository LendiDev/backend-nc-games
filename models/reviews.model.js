const db = require("../db/connection");
const CustomError = require("../utils/custom-error");
const pagination = require("../utils/pagination");

const selectReviews = async (
  category,
  sort_by = "created_at",
  order = "DESC",
  page,
  limit
) => {
  const sortByWhitelist = [
    "owner",
    "title",
    "category",
    "created_at",
    "votes",
    "designer",
    "comment_count",
  ];
  const orderWhitelist = ["ASC", "DESC"];

  if (!orderWhitelist.includes(order.toUpperCase())) {
    throw new CustomError(
      400,
      "Invalid query value of 'order' parameter. ASC or DESC are only permitted"
    );
  }
  if (!sortByWhitelist.includes(sort_by.toLowerCase())) {
    throw new CustomError(400, `Reviews cannot be sorted by '${sort_by}'`);
  }
  if ((page && isNaN(page)) || page < 0) {
    throw new CustomError(
      400,
      `Invalid query value of 'p' parameter. Positive number is only permitted`
    );
  }
  if ((limit && isNaN(limit)) || limit < 0) {
    throw new CustomError(
      400,
      `Invalid query value of 'limit' parameter. Positive number is only permitted`
    );
  }

  const queryValues = [];
  let whereQueryString = "";
  if (category) {
    whereQueryString += "WHERE reviews.category = $1";
    queryValues.push(category);
  }

  const { offset, limit: limit_rows } = pagination(page, limit);

  const {
    rows: [{ reviews, total_count }],
  } = await db.query(
    `
      SELECT (SELECT CAST(COUNT(*) AS INT) FROM reviews ${whereQueryString}) as total_count, (SELECT json_agg(reviews.*) AS reviews FROM (
          SELECT 
              reviews.*, CAST(COUNT(comments.review_id) as INT) as comment_count 
          FROM 
              reviews
          LEFT JOIN comments ON comments.review_id = reviews.review_id
          ${whereQueryString}
          GROUP BY 
              reviews.review_id
          ORDER BY ${sort_by} ${order}
          OFFSET ${offset}
          LIMIT ${limit_rows}
      ) AS reviews);
  `,
    queryValues
  );

  const max_pages = Math.ceil(total_count / limit_rows);

  if (page > max_pages) {
    throw new CustomError(400, `Page is out of range`);
  }

  return { total_count, max_pages, reviews: reviews ? reviews : [] };
};

const selectReviewById = async (review_id) => {
  const {
    rows: [review],
    rowCount,
  } = await db.query(
    `
      SELECT reviews.*, CAST(COUNT(comments.review_id) as INT) as comment_count FROM reviews
      LEFT JOIN comments USING (review_id)
      WHERE review_id = $1
      GROUP BY reviews.review_id;`,
    [review_id]
  );

  if (rowCount === 0)
    throw new CustomError(404, `Review with review_id '${review_id}' not found`);

  return review;
};

const insertReview = async (newReview) => {
  const { owner, title, review_body, designer, category, review_img_url } =
    newReview;

  const reviewImgUrl =
    review_img_url && review_img_url.length > 0
      ? review_img_url
      : "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=700&h=700";

  if (review_body && review_body.length < 20) {
    throw new CustomError(
      400,
      "Review body should be at least 20 characters long"
    );
  }
  if (title && title.length < 3) {
    throw new CustomError(
      400,
      "Review title should be at least 3 characters long"
    );
  }
  if (designer && designer.length < 2) {
    throw new CustomError(400, "Designer should be at least 2 characters long");
  }

  const {
    rows: [insertedReview],
  } = await db.query(
    `
    INSERT INTO reviews 
      (owner, title, review_body, designer, category, review_img_url)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING *, 0 AS comment_count;`,
    [owner, title, review_body, designer, category, reviewImgUrl]
  );

  return insertedReview;
};

const updateReview = async (review_id, patchObject) => {
  const { inc_votes } = patchObject;

  const {
    rows: [review],
  } = await db.query(
    `
      UPDATE reviews 
      SET votes = votes + $2
      WHERE review_id = $1
      RETURNING *`,
    [review_id, inc_votes]
  );

  return review;
};

module.exports = {
  selectReviews,
  selectReviewById,
  insertReview,
  updateReview,
};
