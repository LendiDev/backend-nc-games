const { getReviews, getReviewById } = require("../controllers/reviews.controller");
const reviewsRouter = require("express").Router();

reviewsRouter.get("/", getReviews);
reviewsRouter.get("/:review_id", getReviewById);

module.exports = reviewsRouter;
