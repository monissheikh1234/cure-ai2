export function notFound(req, res, _next) {
  res.status(404).json({
    error: "NotFound",
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || err.status || 500;
  const message =
    status >= 500
      ? "Internal server error"
      : err.message || "Request failed";

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    error: err.name || "Error",
    message
  });
}

