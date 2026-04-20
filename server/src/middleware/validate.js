export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      });
      req.validated = parsed;
      return next();
    } catch (err) {
      return res.status(400).json({
        error: "ValidationError",
        message: "Invalid request",
        issues: err.issues ?? undefined
      });
    }
  };
}

