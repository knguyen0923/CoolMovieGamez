const mongoose = require("mongoose");

//guessr schema/model
const guessrSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      label: "username",
    },
    game: {
      type: String,
      required: true,
      label: "guessr",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    score: {
        type: Number,
        min: 0
    }

  },
  { collection: "guessrScores" }
);

module.exports = mongoose.model('guessrScores', guessrSchema)