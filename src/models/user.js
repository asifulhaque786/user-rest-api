const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("invalid email");
      },
    },
    age: {
      type: Number,

      default: 0,
      validate(value) {
        if (value < 0) throw new Error("age not negative");
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.length <= 7)
          throw new Error("error occurred pass length small");
        if (value.toLowerCase().includes("password"))
          throw new Error("make strong password");
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: { type: Buffer },
  },
  { timestamps: true }
);
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

//JSON.stringify called in res.sen() so we manipluate the object
userSchema.methods.toJSON = function () {
  const jsonobject = this.toObject();
  delete jsonobject.tokens;
  delete jsonobject.password;
  delete jsonobject.avatar
  return jsonobject;
};
userSchema.methods.getToken = async function () {
  const token = await jwt.sign({ _id: this._id.toString() }, process.env.JWT_TOKEN);
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};
userSchema.statics.findByCredential = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("cant login user");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("cant login pass");
  }
  return user;
};
userSchema.pre("remove", async function (next) {
  await Task.deleteMany({ owner: this._id });

  next();
});
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  console.log("in pre");
  next(); //end the call or hangs forever
});
const User = mongoose.model("User", userSchema);
module.exports = User;
