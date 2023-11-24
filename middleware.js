function isAuthenticated(req, res, next) {
  if(!req.session.user) {
    // User is un-authenticated and should be redirected to login
    res.status(401).json({
      text: "User session not found.".toUpperCase(),      
    })
  }
  // User is authenticated, call next in stack.
  next();
}

module.exports = { isAuthenticated }