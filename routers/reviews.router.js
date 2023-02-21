const { getReviews, getCommentsByReviewId, getReviewById } = require("../controllers/reviews.controller");
const reviewsRouter = require("express").Router();

reviewsRouter.get("/", getReviews);
reviewsRouter.get("/:review_id", getReviewById);
reviewsRouter.get("/:review_id/comments", getCommentsByReviewId);

module.exports = reviewsRouter;
