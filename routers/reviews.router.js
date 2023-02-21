const ReviewsController = require("../controllers/reviews.controller");
const CommentsController = require("../controllers/comments.controller");

const reviewsRouter = require("express").Router();

reviewsRouter.get("/", ReviewsController.getReviews);
reviewsRouter.get("/:review_id", ReviewsController.getReviewById);
reviewsRouter.get(
  "/:review_id/comments",
  CommentsController.getCommentsByReviewId
);
reviewsRouter.post(
  "/:review_id/comments",
  CommentsController.postCommentByReviewId
);

module.exports = reviewsRouter;
