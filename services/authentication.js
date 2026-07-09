const JWT = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error("JWT_SECRET environment variable is required");
  process.exit(1);
}

function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    profileImageURL: user.profileImageURL,
    role: user.role,
  };
  const token = JWT.sign(payload, secret, { expiresIn: "7d" });
  return token;
}

function validateToken(token) {
  const payload = JWT.verify(token, secret);
  return payload;
}

module.exports = {
  createTokenForUser,
  validateToken,
};
