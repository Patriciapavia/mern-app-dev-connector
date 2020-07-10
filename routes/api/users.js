const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const { restart } = require("nodemon");
// @route POST api/users
// @desc register user
// @access Plublic
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body; // destruckturing
    try {
      // see if user exists

      let user = await User.findOne({ email }); // findone taking afield which can be username, email..

      if (user) {
        //  if user exist
        return res
          .status(400)
          .json({ errors: [{ mgs: "User Already exist" }] }); // bad request
      }
      // Get user gravata

      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      // create instance user

      user = new User({
        name,
        email,
        avatar,
        password,
      });
      // encrypt password
      // before we can encrypted we need to create salt to hash it

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt); // change password to hash

      await user.save(); // save user

      // return jsonwebtoken
      // create payload

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
