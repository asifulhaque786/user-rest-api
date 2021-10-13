const express = require("express");
const app = express();

var cors = require('cors');
app.use(cors())
require("./db/mongoose");

// const Task = require("./models/task");
const userRouter=require('./routers/userRouter')
const userTask=require('./routers/taskRouter')
const Task=require('./models/task')
app.use(express.json());
const port = process.env.PORT;
app.use(userRouter)
app.use(userTask)

// const main=async ()=>{
//   const task=await Task.findById("613e5203b3df5049412eb950")
//   await task.populate('owner')
//   console.log(task.owner)
// }

// main()
app.listen(port, () => {
  console.log("server up on " + port);
});
