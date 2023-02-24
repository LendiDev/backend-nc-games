const { readEndpointsFromFile } = require("../models/api.model");

const getEndpoints = async (req, res, next) => {
  try {
    const endpoints = await readEndpointsFromFile();

    res.status(200).json(endpoints);
  } catch (err) {
    next(err);
  }
};

const redirectToEndpoints = async (req, res) => {
  res.redirect("/api");
};

module.exports = { getEndpoints, redirectToEndpoints };
