const jwt = require("jsonwebtoken");

const getUserIdFromToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Invalid authorization format");
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, process.env.SECRET_KEY);

  return decoded.user_id;
};

module.exports = { getUserIdFromToken };
