const usersRouter = require('express').Router();
const UsersController = require('../controllers/users.controller')

usersRouter.get('/', UsersController.getUsers);
usersRouter.get('/:username', UsersController.getUserByUsername);

module.exports = usersRouter
