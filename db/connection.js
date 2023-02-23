const { Pool } = require("pg");
const createDatabaseConfig = require("./db-config");

const ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
}

const databaseConfig = createDatabaseConfig(ENV, process.env.DATABASE_URL);

module.exports = new Pool(databaseConfig);
