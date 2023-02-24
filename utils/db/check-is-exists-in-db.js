const db = require("../../db/connection");
const CustomError = require("../custom-error");

const checkIsExistsIn = async (tableName, columnName, equalsToValue, errorDisplayName) => {
  const {
    rows: [{ is_exists: isExists }],
  } = await db.query(
    `SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE ${columnName} = $1) as is_exists`,
    [equalsToValue]
  );

  if (!isExists) {
    throw new CustomError(
      404,
      `${errorDisplayName} with ${columnName} '${equalsToValue}' not found`
    );
  }
};

module.exports = checkIsExistsIn;
