const { promises: fs } = require("fs")
const { readFile } = fs;

const readEndpointsFromFile = async () => {
  const endpoints = await readFile(`${__dirname}/../endpoints.json`);
  return JSON.parse(endpoints);
};

module.exports = { readEndpointsFromFile };
