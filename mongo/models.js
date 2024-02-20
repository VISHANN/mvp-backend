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
});
const User = mongoose.model("User", userSchema);

const reviewSchema = mongoose.Schema(
  {
    workId: mongoose.Schema.Types.ObjectId,
    author: mongoose.Schema.Types.ObjectId,
    rating: String,
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
