const { getReviews } = require("../controllers/reviews.controller");
const reviewsRouter = require("express").Router();

reviewsRouter.get("/", getReviews);

module.exports = reviewsRouter;
