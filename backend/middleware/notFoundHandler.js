const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `端點 ${req.method
      } ${ req.originalUrl } 不存在`,
    },
  });
};

module.exports = { notFoundHandler };
