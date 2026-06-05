export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = status === 500 ? "internal server error" : err.message;

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({
    error: {
      code,
      message,
      details: err.details || {},
    },
  });
}
