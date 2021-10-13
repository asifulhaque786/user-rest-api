const Task = require("../models/task");
const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");

router.post("/tasks", auth, (req, res) => {
  // const task = new Task(req.body);
  const task = new Task({ ...req.body, owner: req.user._id });
  task
    .save()
    .then(() => {
      res.send(task);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

router.get("/tasks", auth, async (req, res) => {
  // Task.find({owner:req.user._id})
  //   .then((tasks) => {
  //     res.send(tasks);
  //   })
  //   .catch((error) => {
  //     res.status(500).send(error);
  //   });
  const match = {};
  const options = {};
  if (req.query.limit) {
    options.limit = parseInt(req.query.limit);
  }
  if (req.query.skip) {
    options.skip = parseInt(req.query.skip);
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    // const valu=parts[0]
    options.sort = {};
    options.sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    console.log(options);
  }
  if (req.query.complete) {
    match.complete = req.query.complete === "true";
  }
  try {
    await req.user.populate({ path: "tasks", match, options });
    res.send(req.user.tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    // const isDeleted = await Task.findByIdAndDelete(req.params.id);
    const isDeleted = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!isDeleted) return res.status(400).send({ error: "no task found" });
    res.send(isDeleted);
  } catch (e) {
    res.status(400).send();
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  // console.log(req.params.id);
  const _id = req.params.id;
  Task.findOne({ _id, owner: req.user._id })
    .then((task) => {
      if (!task) return res.status(400).send("task not found");
      res.send(task);
    })
    .catch((error) => {
      res.status(400).send();
    });
});
module.exports = router;
