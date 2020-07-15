const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// @route GET api/auth
// @desc Test route
// @access Plublic
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.statusa(500).send("server error");
  }
});

// @route POST api/auth
// @desc authenticate user and get token
// @access Plublic
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body; // destruckturing
    try {
      // see if user exists

      let user = await User.findOne({ email }); // findone taking afield which can be username, email..

      if (!user) {
        //  if not user
        return res
          .status(400)
          .json({ errors: [{ mgs: "invalid Credentials" }] }); // bad request
      }

      const isMatch = await bcrypt.compare(password, user.password);
      // password is what we pass in on the top
      // user.password is what we get from database

      if (!isMatch) {
        return res
          .status(400)
          .json({
            errors: [{ mgs: "invalid Credentials / Invalid password" }],
          }); // bad request
      }

      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      ); // need secret key from default.json
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
