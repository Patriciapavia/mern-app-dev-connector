const express = require("express");
const router = express.Router();

// @route GET api/profile
// @desc Test route
// @access Plublic
router.get("/", (req, res) => res.send("profile route"));

module.exports = router;
