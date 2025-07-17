const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

// Middleware to protect routes and update lastSeen
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from DB (excluding password)
      const user = await userModel.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }

      //  Update lastSeen
      user.lastSeen = new Date();
      await user.save();

      req.user = user;
      next();
    } catch (error) {
      console.error("JWT verification failed:", error.message);
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token missing" });
  }
};

//  Middleware to allow only admins
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. No user found in request.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admins only.',
    });
  }

  //  All good — proceed
  next();
};

module.exports = { protect, adminOnly };
