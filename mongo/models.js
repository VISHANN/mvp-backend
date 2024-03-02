const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

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
    work: {
      type: Schema.Types.ObjectId,
      ref: "Work",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

const workSchema = Schema({
  olid: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  authors: [
    {
      olid: String,
      given_name: String,
    },
  ],
  cover: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

const Work = mongoose.model("Work", workSchema);

module.exports = {
  User: User,
  Review,
  Work,
};
