const { Review, User, Work } = require("../mongo/models"),
  { isAuthenticated } = require("../middleware");

const express = require("express"),
  router = express.Router();

const rating = [
  {
    id: "0",
    name: "dislike",
    caption: "Not for me",
  },
  {
    id: "1",
    name: "like",
    caption: "I like it",
  },
  {
    id: "2",
    name: "love",
    caption: "Love this!",
  },
];

// NOTE: the moods ids are not sorted deliberately.
const moods = [
  {
    name: "adventurous",
    id: "0",
  },
  {
    name: "challenging",
    id: "1",
  },
  {
    name: "dark",
    id: "12",
  },
  {
    name: "emotional",
    id: "3",
  },
  {
    name: "funny",
    id: "4",
  },
  {
    name: "hopeful",
    id: "5",
  },
  {
    name: "informative",
    id: "6",
  },
  {
    name: "inspiring",
    id: "7",
  },
  {
    name: "lighthearted",
    id: "8",
  },
  {
    name: "mysterious",
    id: "9",
  },
  {
    name: "reflective",
    id: "10",
  },
  {
    name: "relaxing",
    id: "11",
  },
  {
    name: "sad",
    id: "2",
  },
  {
    name: "tense",
    id: "13",
  },
];

const pace = [
  {
    id: "0",
    name: "Slow",
  },
  {
    id: "1",
    name: "Medium",
  },
  {
    id: "2",
    name: "Fast",
  },
];

router.get("/review/props", (req, res) => {
  res.json({
    rating,
    moods,
    pace,
  });
});

router.post("/review/:id", isAuthenticated, async (req, res) => {
  const workId = req.params.id,
    authorId = req.session.user._id;

  /*
    req.body is review object with structure:
      { 
        rating: StringRatingId,
        moods: [ StringMoodId ],
        text: String,
        pace: StringPaceId,
      }
  */

  const review = req.body;

  review.workId = workId;
  review.authorId = authorId;

  if (review.rating === null) {
    return res.status(422).json({
      code: "bad_form_data",
      text: "Bad form data sent. It either had wrong formatting or some required data missing.",
    });
  }

  const user = await User.findOne({ _id: authorId }).populate(
    "activity.reviews"
  );

  // check if user has already reviewed the work.
  for (let review of user.activity.reviews) {
    if (review.workId === workId) {
      return res.status(400).json({
        code: "bad_request",
        text: "User has already reviewed this work.",
      });
    }
  }

  // find the book in shelves and move it to "have read"
  for (let [shelfId, shelf] of Object.entries(user.shelves)) {
    if (shelf.includes(workId)) {
      // if found inside "have read". User has already done our operation
      if (shelfId === 2) break;

      shelf.splice(shelf.indexOf(workId), 1);
      user.shelves[2].push(workId);

      // calling user.save() inside resolve for Review.create() so that
      // user only changes if a review has successfully been created.
      break;
    }
  }

  Review.create(review)
    .then(async (review) => {
      // push reviewId to work.reviews
      await Work.findOneAndUpdate(
        {
          identifier: {
            olin: workId,
          },
        },
        {
          $push: { reviews: review._id },
        },
        {
          upsert: true,
          returnOriginal: false,
        }
      );

      // push reviewId to user.activity.reviews
      user.activity.reviews.push(review._id);

      await user.save();

      return res.json({
        code: "db_write_successful",
        text: "Review saved successfully",
      });
    })
    .catch((err) => {
      res.json({
        code: "db_write_unsuccessful",
        text: "Could not save your review due to some server error. Please try again.",
      });
    });
});

module.exports = router;
