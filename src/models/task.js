const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema(
  {
    description: { type: String, trim: true, required: true },
    complete: { type: Boolean, default: false },
    owner: {
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId,
      required: true
      
    },
  },
  { timestamps: true }
);
const Task = mongoose.model("Task",taskSchema);
module.exports = Task;
