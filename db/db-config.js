const createDatabaseConfig = (environment, databaseURL) => {
  return environment === "production"
    ? {
        connectionString: databaseURL,
        max: 2,
      }
    : {};
};

module.exports = createDatabaseConfig;
