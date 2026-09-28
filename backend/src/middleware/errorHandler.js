/**
 * Centralized error handler — ensures every endpoint returns { error: string }.
 * Mount last in app.js after all routes.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error("[ERROR]", err.message, err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate resource" });
  }

  res.status(500).json({ error: "Internal server error" });
}

module.exports = errorHandler;
