const { isAuthenticated } = require('../middleware'),
  router = require('express').Router(),
  { User } = require('../mongo/models'),
  { purgeUser, verify, findUser } = require('./lib');

router.get('/api/signin', (req, res) => {
  const authorizationHeader = req.headers['authorization'];
  
  if (authorizationHeader.startsWith('Bearer ')) {
    const jwtToken = authorizationHeader.split(' ')[1];

    verify(jwtToken)
      .then(user => findUser(purgeUser(user)))
      .then(foundUser => {
        const {_id, given_name} = foundUser;
        req.session.user = { _id, given_name};
        console.log('here');
        res.json(foundUser);
      })
      .catch(err => {
        // register new user
        console.log('there')
        res.status(401).json(err);
      })

  } else {
    res.status(401).json({ statusText: 'Incorrect Authorization header configuration'.toUpperCase()}); 
  }
})

router.get('/api/v1/me', isAuthenticated, (req, res) => {
  const userId = req.session.user._id;

  User.findOne({ '_id': userId })
    .then(foundUser => res.json(foundUser))
    .catch(err => res.status(401).json(err));
})

module.exports = router;