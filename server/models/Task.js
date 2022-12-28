const mongoose = require("mongoose");

/* it is often better to have the field that defines the relationship between
   the documents/models in just one model (you can still find the reverse
   relationship by searching for the associated _id in the other mode

   In this case, the relationship between user and task is in task Schema
*/
const TaskSchema = new mongoose.Schema(
  {
    user: {
      // Establish a reference between user and Task document
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", TaskSchema);
