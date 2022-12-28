const Task = require("../models/Task");
const asyncHandler = require("express-async-handler");

// @desc Get all tasks
// @route GET /tasks
// @access Private
const getAllTasks = asyncHandler(async (req, res) => {
  // Get all tasks from MongoDB and attach the username with it
  const tasksWithUser = await Task.find()
    .populate("user", "username")
    .lean()
    .exec();

  // If no tasks
  if (!tasksWithUser.length) {
    return res.status(400).json({ message: "No tasks found" });
  }

  res.json(tasksWithUser);
});

// @desc Create new task
// @route POST /tasks
// @access Private
const createNewTask = asyncHandler(async (req, res) => {
  const { user, title, description } = req.body;

  // Confirm data
  if (!user || !title || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate title
  const duplicate = await Task.findOne({ title }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate task title" });
  }

  // create returns a promise. Hence, you don't need to call exec() method
  const task = await Task.create({ user, title, description });

  if (task) {
    // Created
    return res.status(201).json({ message: "New Task created" });
  } else {
    return res.status(400).json({ message: "Invalid Task data received" });
  }
});

// @desc Update a Task
// @route PATCH /Tasks
// @access Private
const updateTask = asyncHandler(async (req, res) => {
  const { id, user, title, description, completed } = req.body;

  // Confirm data
  if (
    !id ||
    !user ||
    !title ||
    !description ||
    typeof completed !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm task exists to update
  const task = await Task.findById(id).exec();

  if (!task) {
    return res.status(400).json({ message: "Task not found" });
  }

  // Check for duplicate title
  const duplicate = await Task.findOne({ title }).lean().exec();

  // Allow renaming of the original task
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate task title" });
  }

  task.user = user;
  task.title = title;
  task.description = description;
  task.completed = completed;

  const updatedTask = await task.save();

  res.json(`'${updatedTask.title}' updated`);
});

// @desc Delete a task
// @route DELETE /tasks
// @access Private
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Task ID required" });
  }

  // Confirm task exists to delete
  const task = await Task.findById(id).exec();

  if (!task) {
    return res.status(400).json({ message: "Task not found" });
  }

  const result = await task.deleteOne();

  const reply = `Task '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllTasks,
  createNewTask,
  updateTask,
  deleteTask,
};
