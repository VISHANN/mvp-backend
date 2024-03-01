const { Review, User, Work } = require("../mongo/models"),
  { isAuthenticated } = require("../middleware"),
  {
    validateFormData,
    getReviewByWorkOLID,
    findWorkAndUpdateShelves,
  } = require("./lib/review"),
  { getShelfId, updateShelves } = require("./lib");

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

router.get("/review/:id", isAuthenticated, (req, res) => {
  const reviewId = req.params.id;

  Review.findOne({ _id: reviewId })
    // .populate("workId")
    .then((review) => res.json(review))
    .catch((err) => console.log(err));
});

router.post("/review", isAuthenticated, async (req, res) => {
  const workId = req.body.work.id,
    authorId = req.session.user._id;
  const { review, work } = req.body;

  /*
    req.body is review object with structure:
      { 
        review: {
          rating: StringRatingId,
          moods: [ StringMoodId ],
          text: String,
          pace: StringPaceId,
        }
        work: {
          workId,
          title,
          authors,
          coverId
        }
      }
  */

  // Return bad_form_data when rating is missing from review submitted
  if (!validateFormData({ name: "review", data: review })) {
    return res.status(422).json({
      code: "bad_form_data",
      text: "Bad form data sent. It either had wrong formatting or some required data missing.",
    });
  }

  try {
    // Get logged in user from database
    const user = await User.findOne({ _id: authorId });
    const populatedUser = await user.populate({
      path: "activity.reviews",
      populate: {
        path: "work",
      },
    });

    // get user's review for relevant workId
    const userReview = await getReviewByWorkOLID(
      populatedUser.activity.reviews,
      workId
    );

    // if user has already reviewed the work, it is an invalid_request
    if (userReview) {
      res.status(400).json({
        code: "invalid_request",
        text: "User has already reviewed this work.",
      });
    }

    // Shelves will not be updated untill user.save() is called after
    // successful creation of review
    const shelves = findWorkAndUpdateShelves(user.shelves, workId, 2);

    const { id, title, authors, coverId } = work;

    const foundWork = await Work.findOneAndUpdate(
      {
        olid: id,
        title,
        authors,
        cover: coverId,
      },
      {
        $push: { reviews: review._id },
      },
      {
        upsert: true,
        returnOriginal: false,
      }
    );

    review.work = foundWork._id;
    review.author = authorId;

    const createdReview = await Review.create(review);

    // push reviewId to user.activity.reviews
    user.activity.reviews.push(createdReview._id);

    await createdReview.save();
    await user.save();

    res.json({
      code: "db_write_successful",
      text: "Review saved successfully",
    });
  } catch (err) {
    console.log(err);
    res.json({
      code: "db_write_unsuccessful",
      text: "Could not save your review due to some server error. Please try again.",
    });
  }
});

router.put("/review/:id", isAuthenticated, (req, res) => {
  res.json({ text: "edit route for review/:id" });
});

module.exports = router;
