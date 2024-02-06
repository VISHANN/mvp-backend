const express = require('express'),
  router =  express.Router(),
  { User } = require('../mongo/models'),
  { isAuthenticated } = require('../middleware'),
  { findOrCreate, purgeUser, verify, findUser } = require('./lib');

// -----------------------------------------------------------------

router.use(express.json())

// -----------------------------------------------------------------

router.get('/api/v1/u/shelves', isAuthenticated, (req, res) => {
  const userId = req.session.user._id;

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

router.put('/api/v1/u/shelves', isAuthenticated, (req, res) => {
  const userId = req.session.user._id;
  const {targetShelfId, workId, currentShelfId} = req.body;

  let updateUser = null;

  if(targetShelfId !== undefined && currentShelfId !== undefined) {
    // update type is 'MOVE'
    
    updateUser = (user) => {
      if (!user) {
        throw new Error('Unauthorized')
      }

      // remove the work from current shelf
      let currentShelf = user.shelves[currentShelfId];
      currentShelf.splice(currentShelf.indexOf(workId), 1);

      // then add the work to target shelf
      user.shelves[targetShelfId].push(workId);

      // save the user doc
      return user.save();
    }
  } else if (targetShelfId !== undefined) {
    // update type is 'ADD'

    updateUser = (user) => {
      if (!user) {
        throw new Error('Unauthorized')
      }

      // then add the work to target shelf
      user.shelves[targetShelfId].push(workId);

      // save the user doc
      return user.save();
    }
  } else if (currentShelfId !== undefined) {
    // update type is 'REMOVE'
    updateUser = (user) => {
      if (!user) {
        throw new Error('Unauthorized')
      }

      // remove the work from current shelf
      let currentShelf = user.shelves[currentShelfId];
      currentShelf.splice(currentShelf.indexOf(workId), 1);

      // save the user doc
      return user.save();
    }
  } else {
    // throw error update doesn't fit any schema
  }

  User.findOne({ _id: userId })
    .then(user => updateUser(user))
    .then(user => handleSuccess(user))
    .catch(err => res.status(401).json({ code: 'failure' }));
  
  function handleSuccess(user) {
    if (user) {
      res.json({ code: 'success'});
    } else {
      throw new Error('Unauthorized');
    }
  }
})

// -----------------------------------------------------------------

module.exports = router;