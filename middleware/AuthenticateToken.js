const jwt = require("jsonwebtoken");
const JWT_SECRET = "chatsocketio";

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Access Denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ msg: "Invalid Token" });
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
