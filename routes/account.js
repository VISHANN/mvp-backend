const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware");
const { User } = require("../mongo/models");

// --------------------------------------------------------------------------------

// --------------------------------------------------------------------------------

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
        text: "Error occurred while trying to read user from database",
      });
    });
});

// POST route for updating account settings
router.put("/edit", isAuthenticated, (req, res) => {
  // req.body ==>
  //
  // {
  //   profile: {
  //     username: 'uzi',
  //     given_name: 'Ujjwal',
  //     family_name: 'Goswami',
  //     picture: 'https://lh3.googleusercontent.com/a/ACg8ocL3obtbp-ilriIlZeHDDPhpxxPilPhZwzqELo5H6NLr=s96-c',
  //     bio: '',
  //     gender: '0'
  //   }
  // }

  const { given_name, family_name, bio, gender } = req.body.profile;
  User.findOneAndUpdate(
    { _id: req.session.user._id },
    {
      given_name,
      family_name,
      profile: {
        bio,
        gender,
      },
    },
    {
      returnOriginal: false,
    }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        res.status(451).json({
          code: "user_account_deleted",
          text: "The user account associated with this session has been deleted.",
        });
      }

      // else user has been updated
      res.json(updatedUser);
    })
    .catch((err) =>
      res.status(500).json({
        code: "db_write_unsuccessful",
        text: "Error occurred while trying to update user to database",
      })
    );
});

// --------------------------------------------------------------------------------

module.exports = router;
