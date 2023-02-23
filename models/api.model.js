const { readFile } = require("fs/promises");

const readEndpointsFromFile = async () => {
  const endpoints = await readFile(`${__dirname}/../endpoints.json`);
  return JSON.parse(endpoints);
};

module.exports = { readEndpointsFromFile };
