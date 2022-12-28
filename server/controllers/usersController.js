const User = require("../models/User");
const Task = require("../models/Task");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// express-async-handler saves you from writing your own try/catch for those async errors
// It passes the error onto next(), which in this case is to your errorHandler
// https://zellwk.com/blog/async-await-express/

// If you want to end early, use the return statement
// https://stackoverflow.com/questions/52919585/node-js-return-res-status-vs-res-status

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  // Omit the password field
  // lean - Gives you POJO, instead of Mongoose documents
  // With lean(), your result object will miss out on some features
  // such as getters/setters. However, memory size is 5x smaller.
  // As a general rule, use lean() if you don't want to modify the object (GET)
  const users = await User.find().select("-password").lean();
  if (!users.length) {
    return res.status(400).json({ messaege: "No users found" });
  }
  res.json(users);
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;

  // Validation
  if (!username || !email || !password) {
    // These are specific errors that we will send back to user
    // If there are other errors, our error handler middleware will be executed
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate email
  const userExist = await User.findOne({ email }).lean().exec();

  if (userExist) {
    return res.status(409).json({ message: "Email already exist!" });
  }

  // Hash password
  // Add 10 salt rounds
  const hashedPassword = await bcrypt.hash(password, 10);

  const userObject = { username, password: hashedPassword, email };

  // Create and store new user into MongoDB
  const user = await User.create(userObject);

  // We are not using a return statement because we are at the end here, hence we
  // use an if else instead (WHY?)
  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Update new user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  // print out the types to see
  const { id, username, email, active, password } = req.body;

  // Validation
  if (!id || !username || !email || typeof active !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check if email has already been used by other users
  const userExist = await User.findOne({ email, _id: { $ne: id } })
    .lean()
    .exec();

  if (userExist) {
    return res.status(409).json({ message: "Duplicate email" });
  }

  user.username = username;
  user.email = email;
  user.active = active;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

// @desc Delete user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  // Does the user still have assigned tasks?
  const task = await Task.findOne({ user: id }).lean().exec();
  if (task) {
    return res.status(400).json({ message: "User has assigned tasks" });
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
