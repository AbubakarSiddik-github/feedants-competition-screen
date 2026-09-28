const jwt = require("jsonwebtoken");

/**
 * Hard require — returns 401 if no valid token.
 * Use on mutating endpoints (register, submit).
 */
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Optional — attaches user if token is present and valid, otherwise continues.
 * Use on read endpoints so anonymous visitors can still view the screen.
 */
function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Ignore invalid tokens on optional endpoints
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
