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

  const { rows: reviews, rowCount } = await db.query(
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
  const { rows, rowCount } = await db.query(
    `
      SELECT reviews.*, CAST(COUNT(comments.review_id) as INT) as comment_count FROM reviews
      LEFT JOIN comments USING (review_id)
      WHERE review_id = $1
      GROUP BY reviews.review_id;`,
    [review_id]
  );

  if (rowCount === 0) throw new CustomError(404, "Review not found");

  return rows[0];
};

module.exports = { selectReviews, selectReviewById };
