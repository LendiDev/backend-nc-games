const usersRouter = require('express').Router();
const UsersController = require('../controllers/users.controller')

usersRouter.get('/', UsersController.getUsers);

module.exports = usersRouter
