const { selectReviews } = require("../models/reviews.model");

const getReviews = async (req, res, next) => {
  try {
    const reviews = await selectReviews();

    res.status(200).send({ reviews });
  } catch (err) {
    next(err);
  }
};

module.exports = { getReviews };
