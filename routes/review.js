const express = require("express"),
  router = express.Router();

const { Review, User } = require("../mongo/models"),
  { isAuthenticated } = require("../middleware"),
  {
    validateFormData,
    getReviewByWorkOLID,
    findWorkAndUpdateShelves,
  } = require("./lib/review"),
  { findOrCreateWork } = require("./lib");

const errors = require("../codes/error.json");

router.post("/review", isAuthenticated, async (req, res) => {
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
          id,
          title,
          authors,
          cover
        }
      }
  */

  const workId = req.body.work.id,
    authorId = req.session.user._id;

  const { review, work } = req.body;

  // Return bad_form_data when rating is missing from review submitted
  if (!validateFormData({ name: "review", data: review })) {
    return res.status(422).json({
      code: errors.bad_form_data,
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
        code: errors.invalid_request,
        text: "User has already reviewed this work.",
      });
    }

    // Shelves will not be updated untill user.save() is called after
    // successful creation of review
    const shelves = findWorkAndUpdateShelves(user.shelves, workId, 2);

    // Work would exist if someone had reviewed it previously
    // If not create one.
    const foundWork = await findOrCreateWork(work);

    // Add work _id and user _id before adding review to db
    review.work = foundWork._id;
    review.author = authorId;

    // Create Review
    const createdReview = await Review.create(review);

    // add review to work.reviews for the related work
    foundWork.reviews.push(createdReview._id);

    // push reviewId to user.activity.reviews
    user.activity.reviews.push(createdReview._id);

    await foundWork.save();
    await user.save();

    res.json({
      code: errors.db_write_successful,
      text: "Review saved successfully",
    });
  } catch (err) {
    // CONSOLE
    console.log(err);
    res.json({
      code: errors.db_write_unsuccessful,
      text: "Could not save your review due to some server error. Please try again.",
    });
  }
});

router.put("/review/:id", isAuthenticated, (req, res) => {
  Review.findOneAndUpdate(
    {
      _id: req.params.id,
      author: req.session.user._id,
    },
    req.body.review,
    {
      returnOriginal: false,
    }
  )
    .then((review) => {
      res.json({
        code: errors.db_write_successful,
        text: "Review edited successfully",
      });
    })
    .catch((err) => {
      console.log("Error: /review/:id", err);
      res.json({
        code: errors.db_write_unsuccessful,
        text: "Could not save your review due to some server error. Please try again.",
      });
    });
});

module.exports = router;
