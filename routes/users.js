const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
let User = require("../schemas/user");
const bcryptjs = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("server Error...");
  }
});

router.get("/users", async (req, res) => {
  try {
    let users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("server Error...");
  }
});

router.get("/by_email/:user_email", async (req, res) => {
  try {
    let userEmail = req.params.user_email;
    let user = await User.findOne({ email: userEmail }).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error");
  }
});
router.get("/by_userid/:user_id", async (req, res) => {
  try {
    let userId = req.params.user_id;
    let user = await User.findById(userId).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error");
  }
});

router.post(
  "/register",
  [
    check("name", "name is empty").not().isEmpty(),
    check("lastname", "Last name is empty").not().isEmpty(),
    check("username", "username is empty").not().isEmpty(),
    check("email", "Email is Empty").isEmail(),
    check("password", "Passowrd Should be 8 to 15 characters long.").isLength({
      min: 8,
      max: 15,
    }),
  ],
  async (req, res) => {
    try {
      let { name, lastname, username, email, password } = req.body;
      let user = await User.findOne({ email }).select("-password");
      let fetchedusername = await User.findOne({ username }).select(
        "-password"
      );
      let errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
      if (user) return res.status(401).send("User is already exists");
      if (fetchedusername === username)
        return res.status(401).send("Username is Taken");

      const avatar = gravatar.url(email, {
        r: "pg",
        d: "mm",
        s: "200",
      });

      let newuser = new User({
        name,
        lastname,
        username,
        email,
        password,
        avatar,
      });
      const salt = await bcryptjs.genSalt(10);
      let hashedpassword = await bcryptjs.hash(password, salt);
      newuser.password = hashedpassword;

      await newuser.save();
      const payload = {
        user: {
          id: newuser._id,
        },
      };
      jwt.sign(
        payload,
        config.get("jsonWebTokenSecret"),
        { expiresIn: 3600 },
        (e, token) => {
          if (e) throw e;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("server Error...");
    }
  }
);
router.post(
  "/login",
  [
    check("email", "Email is Empty").isEmail(),
    check("password", "Passowrd Should be 8 to 15 characters long.").isLength({
      min: 8,
      max: 15,
    }),
  ],
  async (req, res) => {
    try {
      let { email, password } = req.body;
      let user = await User.findOne({ email });
      let errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
      if (!user) return res.status(404).send("New user, signup?");

      let verify = bcryptjs.compare(password, user.password);
      if (!verify) {
        return res.status(401).json("Passwords do not match");
      }
      const payload = {
        user: {
          id: user._id,
        },
      };
      jwt.sign(
        payload,
        config.get("jsonWebTokenSecret"),
        { expiresIn: 3600 },
        (e, token) => {
          if (e) throw e;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("server Error...");
    }
  }
);


module.exports = router;
