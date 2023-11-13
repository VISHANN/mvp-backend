function isAuthenticated(req, res, next) {
  console.log(req.session);
  next();
}

module.exports = { isAuthenticated }