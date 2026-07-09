function requireAuth(req, res, next) {
  if (!req.user) {
    return res.redirect("/user/signin");
  }
  next();
}

module.exports = { requireAuth };
