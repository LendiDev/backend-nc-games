const { selectUsers, selectUserByUsername } = require("../models/users.model");

const getUsers = async (req, res, next) => {
  try {
    const users = await selectUsers();

    res.status(200).send({ users });
  } catch (err) {
    next(err);
  }
};

const getUserByUsername = async (req, res, next) => {
  const { username } = req.params;

  try {
    const user = await selectUserByUsername(username);

    res.status(200).send({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getUsers, getUserByUsername };
