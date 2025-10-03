
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {


    const authHeader = req.headers.authorization;

    if (!authHeader) {

      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {

      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }



    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(" Token verified successfully for user:", {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    req.user = decoded;
    next();
  } catch (error) {


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