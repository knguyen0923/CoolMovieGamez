const express = require("express");
const router = express.Router();
const newUserModel = require('../../models/userModel')

router.get("/", async (req, res) => {
  try {
    const users = await newUserModel.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;