const mongoose = require("mongoose");
const validator = require("validator");
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
});



// me.save()
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.log(error);
//   });
// task
//   .save()
//   .then((task) => {
//     console.log(task);
//   })
//   .catch((error) => {
//     console.log(error);
//   });