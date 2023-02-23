const CommentsController = require('../controllers/comments.controller');

const commentsRouter = require('express').Router();

commentsRouter.delete('/:comment_id', CommentsController.deleteCommentById);

module.exports = commentsRouter;
