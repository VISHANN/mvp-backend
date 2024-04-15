const router = require("express").Router();
const { isAuthenticated } = require("../middleware");
const { User } = require("../mongo/models");

// routes
router.get("/edit", isAuthenticated, (req, res) => {
  User.findOne({ _id: req.session.user._id })
    .then((user) => {
      if (!user) {
        res.status(404).json({
          code: "user_not_found",
          text: "Could not find this user in database",
        });
      }

      res.json({
        profile: {
          username: user.username,
          given_name: user.given_name,
          family_name: user.family_name,
          picture: user.picture,
          bio: user.profile.bio,
          gender: user.profile.gender,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        code: "db_read_unsuccessful",
        text: "Error occurred while trying to read User from database",
      });
    });
});

module.exports = router;
