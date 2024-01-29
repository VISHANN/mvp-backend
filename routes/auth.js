const express = require('express'),
  router =  express.Router(),
  { User } = require('../mongo/models'),
  { isAuthenticated } = require('../middleware'),
  { findOrCreate, purgeUser, verify, findUser } = require('./lib');

// -----------------------------------------------------------------

router.use(express.json())

// -----------------------------------------------------------------

router.get('/api/signin', (req, res) => {
  const authorizationHeader = req.headers['authorization'];
  
  if (authorizationHeader.startsWith('Bearer ')) {
    const jwtToken = authorizationHeader.split(' ')[1];

    verify(jwtToken)
      .then(user => {
        return new Promise((resolve, reject) => {
          findUser(purgeUser(user))
            .then(foundUser => {
              // user is not registered as mongoose returns empty doc when no match found

              if (!foundUser) {
                req.session.user = user;

                throw new Error({
                  errorCode: 'user_not_registered',
                  errorMessage: 'User is not registered, let user to Sign Up by choosing a unique username.'
                })
              } else {
                resolve(foundUser);
              }
            })
            .catch(err => reject(err))
        })
      })
      .then(foundUser => {
        const {_id, given_name} = foundUser;
        req.session.user = { _id, given_name};

        return res.json(foundUser);
      })
      .catch(err => {
        console.error('/routes/auth.js: signin_100 \n');
        res.status(401).json(err);
      })

  } else {
    res.status(401).json({ statusText: 'Incorrect Authorization header configuration'.toUpperCase()}); 
  }
})

router.get('/api/v1/me', isAuthenticated, (req, res) => {
  const userId = req.session.user._id;

  if(!userId) {
    // User has no session
    // TODO: Manage this response at frontend.
    
    res.status(401).json({ message: 'User session not present'.toUpperCase()})
  }

  User.findOne({ '_id': userId })
    .then(foundUser => res.json(foundUser))
    .catch(err => res.status(401).json(err));
})

router.post('/api/v1/signup', (req, res) => {
  // check if user has a session, which was setup by /api/signin.
  // purgedUser was stored at req.session.user 
  const user = req.session.user;
  const { username } = req.body;

  user.username = username;

  findOrCreate(purgeUser(user))
    .then(returnedUser => {
      // replace with post-login session
      const {_id, given_name} = returnedUser;
      req.session.user = { _id, given_name};

      return res.json(returnedUser);
    })
    .catch(err => {
      console.log('/routes/auth.js: Line 30 \n ' + err);
      res.status(404).json(err);
    })
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