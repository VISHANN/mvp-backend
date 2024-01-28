const mongoose = require('mongoose');

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
});
const User = mongoose.model('User', userSchema);

module.exports = {
  User: User
}