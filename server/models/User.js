const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // ObjectId will be created automatically. Therefore, no need include.
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("User", userSchema);
