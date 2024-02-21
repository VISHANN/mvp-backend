const express = require("express"),
  router = express.Router(),
  { User } = require("../mongo/models"),
  { isAuthenticated } = require("../middleware"),
  { findOrCreate, purgeUser, verify, findUser } = require("./lib");

// -----------------------------------------------------------------

router.use(express.json());

// -----------------------------------------------------------------

router.get("/api/v1/me", isAuthenticated, (req, res) => {
  const userId = req.session.user._id;

  User.findOne({ _id: userId })
    .then((foundUser) => res.json(foundUser))
    .catch((err) => res.status(401).json(err));
});

router.post("/api/v1/validate", (req, res) => {
  const username = req.body.username;

  // if username is not between 3-20 char
  if (username.length < 3 || username.length > 20) {
    // try to convert to: { code: "username_invalid", text: "Username already exists. "}
    res.json({ isValid: false, code: "Username Invalid" });
  }

  User.findOne({ username: username })
    .then((foundUser) => handleFoundUser(foundUser))
    .catch((err) => res.status(401).json("DB Error".toUpperCase));
  // res.status(401).json({ code: 'db_read_error', text: 'There was internal issue while finding User' })

  function handleFoundUser(foundUser) {
    if (foundUser) {
      // try to convert to: { code: "username_invalid", text: "Username already exists. "}
      res.json({ isValid: false, code: "Username Invalid" });
    } else {
      // findOne returns empty doc when no doc matches.
      // try to convert to: { code: "username_invalid", text: "Username already exists. "}
      res.json({ isValid: true, code: "Username Valid" });
    }
  }
});
router.get("/api/signin", (req, res) => {
  const authorizationHeader = req.headers["authorization"];

  if (authorizationHeader.startsWith("Bearer ")) {
    const jwtToken = authorizationHeader.split(" ")[1];

    verify(jwtToken)
      .then((user) => {
        return new Promise((resolve, reject) => {
          findUser(purgeUser(user))
            .then((foundUser) => {
              // user is not registered as mongoose returns empty doc when no match found

              if (!foundUser) {
                req.session.user = user;

                throw new Error({
                  code: "user_not_registered",
                  text: "User is not registered, let user Sign Up by choosing a unique username.",
                });
              } else {
                resolve(foundUser);
              }
            })
            .catch((err) => reject(err));
        });
      })
      .then((foundUser) => {
        const { _id, given_name } = foundUser;
        req.session.user = { _id, given_name };

        return res.json(foundUser);
      })
      .catch((err) => {
        console.error("/routes/auth.js: signin_100 \n");
        res.status(401).json(err);
      });
  } else {
    res.status(401).json({
      code: "bad_authorization_token",
      text: "Bearer Token sent as Authorization header is invalid.",
    });
  }
});

router.post("/api/v1/signup", (req, res) => {
  // check if user has a session, which was setup by /api/signin.
  // purgedUser was stored at req.session.user
  const user = req.session.user;
  const { username } = req.body;

  user.username = username;

  // temporary fix
  const purgedUser = purgeUser(user);
  purgedUser.shelves = {
    0: [],
    1: [],
    2: [],
    3: [],
  };

  findOrCreate(purgedUser)
    .then((returnedUser) => {
      // replace with post-login session
      const { _id, given_name } = returnedUser;
      req.session.user = { _id, given_name };

      return res.json(returnedUser);
    })
    .catch((err) => {
      console.log("/routes/auth.js: Line 30 \n " + err);
      res.status(404).json(err);
    });
});

router.post("/api/v1/signout", isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(401).json({
        code: "logout_unsuccessful",
        text: "We could not log you out. Please try logging out again",
      });
    }

    res.json({
      code: "logout_successful",
      text: "You have successfully logged out. We will miss you.",
    });
  });
});

// router.post('/api/v1/signup', (req, res) => {
//   const authorizationHeader = req.headers['authorization'];
//   const username = req.body.username;

//   if (authorizationHeader.startsWith('Bearer ')) {
//     const jwtToken = authorizationHeader.split(' ')[1];

//     verify(jwtToken)
//       .then(user => {

//         let purgedUser = purgeUser(user);
//         purgedUser.username = username;

//         return findOrCreate(purgedUser);
//       })
//       .then(returnedUser => {
//         const {_id, given_name} = returnedUser;
//         req.session.user = { _id, given_name};

//         return res.json(returnedUser);
//       })
//       .catch(err => {
//         // register new user
//         console.log(err); // delete

//         res.status(404).json(err);
//       })

//   } else {
//     res.status(401).json({ statusText: 'Incorrect Authorization header configuration'.toUpperCase()});
//   }
// })

module.exports = router;
