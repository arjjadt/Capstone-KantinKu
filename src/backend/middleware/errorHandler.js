const apiResponse = require('../utils/apiResponse');
const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof multer.MulterError) {
    return apiResponse.error(res, `Upload error: \${err.message}`, 400);
  }

  apiResponse.error(res, 'Internal server error', 500, err.message);
};

module.exports = errorHandler;
