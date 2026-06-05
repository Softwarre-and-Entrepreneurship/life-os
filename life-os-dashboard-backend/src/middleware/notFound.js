export function notFound(req, res) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `route not found: ${req.method} ${req.originalUrl}`,
      details: {},
    },
  });
}
