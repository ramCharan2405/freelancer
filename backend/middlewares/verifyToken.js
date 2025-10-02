// verifyToken.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    console.log("🔐 Token verification started");

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("❌ No authorization header found");
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      console.log("❌ No token found in authorization header");
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    console.log("🔍 Token found, verifying...");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ Token verified successfully for user:", {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token has expired. Please login again." });
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please login again." });
    } else {
      return res.status(401).json({ error: "Token verification failed." });
    }
  }
};

module.exports = verifyToken;