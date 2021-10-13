const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth.js");
const multer = require("multer");
const sharp=require('sharp')
const {sendwelcomeEmail,sendendEmail}=require('../emails/account')

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send("h");
  }
});
router.post("/users/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send("h");
  }
});
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredential(req.body.email, req.body.password);
    const token = await user.getToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send("cant login" + e);
  }
});
router.post("/users", async (req, res) => {
  // console.log(req.body);

  try {
    const user = await new User(req.body);

    await user.save(); //throw exception if error
    sendwelcomeEmail(user.email,user.name)
    const token = await user.getToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
  // promise.then(()=>{})
  // user
  //   .save()
  //   .then(() => {
  //     res.send(user);
  //   })
  //   .catch((error) => {
  //     res.status(400);
  //     res.send(error);
  //   });
});
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
  // try {
  //   const users = await User.find({});
  //   res.send(users);
  // } catch (error) {
  //   res.status(500).send(error);
  // }
  // User.find({})
  //   .then((users) => {
  //     res.send(users);
  //   })
  //   .catch((error) => {
  //     res.status(500).send(error);
  //   });
});
// @depricated
router.get("/users/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
  // console.log(req.params.id);
  // User.findById(req.params.id)
  //   .then((user) => {
  //     if (!user) return res.status(500).send("user not found");
  //     res.send(user);
  //   })
  //   .catch((error) => {
  //     res.status(500).send();
  //   });
});

router.patch("/users/me", auth, async (req, res) => {
  const keys = Object.keys(req.body);
  const validFields = ["name", "age", "email", "password"];
  const isalltrue = keys.every((feild) => validFields.includes(feild));
  if (!isalltrue) return res.status(400).send({ error: "no feild found" });
  try {
    // const user = await User.findById(req.user._id);
    keys.forEach((key) => (req.user[key] = req.body[key]));
    await req.user.save();
    //below doesnt allow middleware
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    // we know user exoisted
    // if (!user) res.status(400).send();
    res.send(req.user);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    //old method new is    ---->await  req.user.remove();
    // const isDeleted = await User.findByIdAndDelete(req.user._id);
    // if (!isDeleted) return res.status(400).send({ error: "no user found" });
    await req.user.remove();
    sendendEmail(req.user.email,req.user.name)
    res.send(req.user);
  } catch (e) {
    res.status(400).send();
  }
});
const upload = multer({
  // dest: "avatars", if provided cant access imag binary in callback(req,res)
  limits: { fileSize: 3000000 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(pdf|jpg)$/)) {
      // if (!file.originalname.endsWith(".pdf")) {
      return cb(new Error("file must be pdf"));
    }
    cb(undefined, true);
  },
});
/* <img src="data:image.jpg;base64,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
            9k=">*/
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer=await sharp(req.file.buffer).png().resize({width:100,height:100}).toBuffer()
    req.user.avatar =buffer ;
    await req.user.save();
    res.set("Content-Type", "image/jpg");
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) throw new Error("invalid ");
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(400).send();
  }
});
router.delete(
  "/users/me/avatar",
  auth,
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);
module.exports = router;
