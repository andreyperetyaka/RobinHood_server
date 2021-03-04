exports.errorHandler = (error, response) => {
  response.status(500).json({
    success: false,
    message: error.message ? error.message : error,
  });
};
