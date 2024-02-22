const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  given_name: String,
  family_name: String,
  picture: String,
  username: String,
  provider: {
    name: String,
    providerId: String,
    email: String,
    email_verified: Boolean,
  },
  shelves: {
    0: [String],
    1: [String],
    2: [String],
    3: [String],
  },
  activity: {
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
});
const User = mongoose.model("User", userSchema);

const reviewSchema = mongoose.Schema(
  {
    workId: {
      type: String,
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    rating: {
      type: String,
      required: true,
    },
    text: String,
    moods: [String],
    pace: String,
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);
const Review = mongoose.model("Review", reviewSchema);

module.exports = {
  User: User,
  Review,
};
