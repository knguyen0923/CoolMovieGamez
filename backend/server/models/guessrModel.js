const mongoose = require("mongoose");

//guessr schema/model
const guessrSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      label: "username",
    },
    email: {
      type: String,
      required: false,
      label: "email",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    score: {
        type: int,
        min: 0
    },
    highscore: {
        type: int
    },
    
  },
  { collection: "guessrScores" }
);

module.exports = mongoose.model('guessrScores', newUserSchema)