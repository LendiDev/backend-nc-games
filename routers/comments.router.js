const CommentsController = require('../controllers/comments.controller');

const commentsRouter = require('express').Router();

commentsRouter.delete('/:comment_id', CommentsController.deleteCommentById);
commentsRouter.patch('/:comment_id', CommentsController.patchComment);

module.exports = commentsRouter;
