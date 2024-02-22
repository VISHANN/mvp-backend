const { Review, User } = require("../mongo/models"),
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
  { name: "adventurous", id: "0" },
  { name: "challenging", id: "1" },
  { name: "dark", id: "12" },
  { name: "emotional", id: "3" },
  { name: "funny", id: "4" },
  { name: "hopeful", id: "5" },
  { name: "informative", id: "6" },
  { name: "inspiring", id: "7" },
  { name: "lighthearted", id: "8" },
  { name: "mysterious", id: "9" },
  { name: "reflective", id: "10" },
  { name: "relaxing", id: "11" },
  { name: "sad", id: "2" },
  { name: "tense", id: "13" },
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
router.post("/review/:id", isAuthenticated, (req, res) => {
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

  Review.create(review)
    .then(async (review) => {
      // add the work to user
      let user = await User.findOne({ _id: authorId });

      // push reviewId to user.activity.reviews
      user.activity.reviews.push(review._id);

      // add work to user's have read shelves
      user.shelves[2].push(workId);

      await user.save();

      return res.json({
        code: "db_write_successful",
        text: "Review saved successfully",
      });
    })
    .catch((err) => {
      console.error(err);
      res.json({
        code: "db_write_unsuccessful",
        text: "Could not save your review due to some server error. Please try again.",
      });
    });
});

module.exports = router;
