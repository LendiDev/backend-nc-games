const db = require("../db/connection");
const CustomError = require("../utils/custom-error");

const selectUsers = async () => {
  const { rows: users } = await db.query(`SELECT * FROM users`);
  return users;
};

const selectUserByUsername = async (username) => {
  const { rows: [user], rowCount } = await db.query(
    `SELECT * FROM users WHERE username = $1`,
    [username]
  );

  if (rowCount === 0) {
    throw new CustomError(404, `User with username '${username}' not found`);
  }

  return user;
};

module.exports = { selectUsers, selectUserByUsername };
