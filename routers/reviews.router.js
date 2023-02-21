const { getReviews, getCommentsByReviewId } = require("../controllers/reviews.controller");
const reviewsRouter = require("express").Router();

reviewsRouter.get("/", getReviews);

reviewsRouter.get("/:review_id/comments", getCommentsByReviewId);

module.exports = reviewsRouter;
