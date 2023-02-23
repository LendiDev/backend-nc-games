const apiRouter = require("express").Router();
const { getEndpoints } = require("../controllers/api.controller");
const categoriesRouter = require("../routers/categories.router");
const commentsRouter = require("../routers/comments.router");
const reviewsRouter = require("../routers/reviews.router");
const usersRouter = require("../routers/users.router");

apiRouter.get("/", getEndpoints);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/reviews', reviewsRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/users', usersRouter);

module.exports = apiRouter;