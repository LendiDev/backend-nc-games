const db = require("../db/connection");
const CustomError = require("../utils/custom-error");

const selectReviews = async (
  category,
  sort_by = "created_at",
  order = "DESC"
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
      "Wrong query parameter of 'order'. ASC or DESC are only permitted"
    );
  }

  if (!sortByWhitelist.includes(sort_by.toLowerCase())) {
    throw new CustomError(400, `Reviews cannot be sorted by '${sort_by}'`);
  }

  const queryValues = [];
  let whereQueryString = "";
  if (category) {
    whereQueryString += "WHERE review.category = $1";
    queryValues.push(category);
  }

  const { rows: reviews } = await db.query(
    `
      SELECT 
          review.*, CAST(COUNT(comments.review_id) as INT) as comment_count 
      FROM 
          reviews review
      LEFT JOIN comments USING (review_id)
      ${whereQueryString}
      GROUP BY 
          review.review_id
      ORDER BY ${sort_by} ${order};
  `,
    queryValues
  );

  return reviews;
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
    throw new CustomError(404, `Review with review_id '${review_id}' found`);

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
    throw new CustomError(400, 'Review body should be at least 20 characters long')
  }
  if (title && title.length < 3) {
    throw new CustomError(400, 'Review title should be at least 3 characters long')
  }
  if (designer && designer.length < 2) {
    throw new CustomError(400, 'Designer should be at least 2 characters long')
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
