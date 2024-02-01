const express = require('express'),
  router =  express.Router(),
  { User } = require('../mongo/models'),
  { isAuthenticated } = require('../middleware'),
  { findOrCreate, purgeUser, verify, findUser } = require('./lib');

// -----------------------------------------------------------------

router.use(express.json())

// -----------------------------------------------------------------

router.get('/api/v1/u/shelves', (req, res) => {
  const userId = req.session.user._id;
  console.log(userId)

  User.findOne({ '_id': userId})
    .then(user => {
      if(!user) {
        console.log('Err: No user found')
        res.status(404).json({ code: 'user_not_found'});
      } else {
        res.json(user.shelves);
      }
    })
    .catch(err => console.log(err));
});

router.put('/api/v1/u/shelves', (req, res) => {
  const userId = req.session.user._id;
  const {targetShelfId, workId} = req.body;

  if (targetShelfId !== undefined) {
    User.findOne({ '_id': userId})
      .then(user => {
        if (!user) {
          throw new Error('Unauthorized')
        }
        user.shelves[targetShelfId].push(workId);
        res.json({ code: 'success'});
      })
      .catch(err => res.status(401).json({ code: 'unauthorized'}))
  }
})

// -----------------------------------------------------------------

module.exports = router;