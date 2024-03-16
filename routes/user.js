const express = require("express"),
  router = express.Router(),
  { User, Review } = require("../mongo/models"),
  { isAuthenticated } = require("../middleware");

// -----------------------------------------------------------------

router.use(express.json());

// -----------------------------------------------------------------

router.get("/api/v1/u/shelves", isAuthenticated, (req, res) => {
  const userId = req.session.user._id;

  User.findOne({ _id: userId })
    .then((user) => {
      if (!user) {
        console.log("Err: No user found");
        res.status(404).json({ code: "user_not_found" });
      } else {
        res.json(user.shelves);
      }
    })
    .catch((err) => console.log(err));
});

router.put("/api/v1/u/shelves", isAuthenticated, (req, res) => {
  const userId = req.session.user._id;
  const { targetShelfId, workId, currentShelfId } = req.body;

  let updateUser = null;

  if (targetShelfId !== undefined && currentShelfId !== undefined) {
    // update type is 'MOVE'

    updateUser = (user) => {
      if (!user) {
        throw new Error("Unauthorized");
      }

      // remove the work from current shelf
      let currentShelf = user.shelves[currentShelfId];
      currentShelf.splice(currentShelf.indexOf(workId), 1);

      // then add the work to target shelf
      user.shelves[targetShelfId].push(workId);

      // save the user doc
      return user.save();
    };
  } else if (targetShelfId !== undefined) {
    // update type is 'ADD'

    updateUser = (user) => {
      if (!user) {
        throw new Error("Unauthorized");
      }

      // then add the work to target shelf
      user.shelves[targetShelfId].push(workId);

      // save the user doc
      return user.save();
    };
  } else if (currentShelfId !== undefined) {
    // update type is 'REMOVE'
    updateUser = (user) => {
      if (!user) {
        throw new Error("Unauthorized");
      }

      // remove the work from current shelf
      let currentShelf = user.shelves[currentShelfId];
      currentShelf.splice(currentShelf.indexOf(workId), 1);

      // save the user doc
      return user.save();
    };
  } else {
    // throw error update doesn't fit any schema
  }

  User.findOne({ _id: userId })
    .then((user) => updateUser(user))
    .then((user) => handleSuccess(user))
    .catch((err) => res.status(401).json({ code: "failure" }));

  function handleSuccess(user) {
    if (user) {
      res.json({ code: "success" });
    } else {
      throw new Error("Unauthorized");
    }
  }
});

router.get("/api/v1/me/activity/reviews", isAuthenticated, (req, res) => {
  const userId = req.session.user._id;

  // Populate user's reviews under activity first and
  // then populate review's work but include olid and exclude _id fields from work.

  User.findOne({ _id: userId })
    .populate({
      path: "activity.reviews",
      populate: {
        path: "work",
        select: "olid -_id",
      },
    })
    .then((user) => {
      res.json(user.activity.reviews);
    })
    .catch((err) => {
      res.status(401).json({
        code: "db_read_unsuccessful",
        text: "Could not read from database.",
      });
    });
});

router.get("/api/v1/me/review/:id", isAuthenticated, (req, res) => {
  const reviewId = req.params.id,
    userId = req.session.user._id;

  Review.findOne({ _id: reviewId })
    .populate("work")
    .then((review) => {
      if (review.author.equals(userId)) return res.json(review);
    })
    .catch((err) => console.log(err));
});
// -----------------------------------------------------------------

module.exports = router;
