function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    // User is un-authenticated and should be redirected to login
    return res.status(401).json({
      errCode: 'user_not_authenticated',
      errText: "User is not authenticated. Please log in"
    })
  }

  if (req.session.user && req.session.user.sub) {
    // User clicked GoogleSignIn button. Since the user in not registered
    // with us, we have initialized a session. Here we check if session is 
    // of that type.
    return res.status(401).json({
      errCode: 'user_signup_incomplete',
      errText: "User session active as the user tried logging in but didn't complete registration by username",
    })
  }

  // User is authenticated, call next in stack.
  next();
}

module.exports = { isAuthenticated }