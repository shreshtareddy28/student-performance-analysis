import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token after "Bearer "

  if (!token) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((role) => role.toLowerCase());
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No user authenticated" });
    }

    const userRole = req.user.role?.toLowerCase();
    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }

    next();
  };
};

export default authMiddleware;
