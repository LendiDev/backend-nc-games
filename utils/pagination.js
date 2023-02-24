const pagination = (page = 1, limit = 10) => {
  return { offset: (page - 1) * limit, limit };
};

module.exports = pagination;
