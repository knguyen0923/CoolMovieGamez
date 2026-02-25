// loads mongoose libarary 
const mongoose = require("mongoose");

// Hilo Score model
const newHiloScoreSchema = new mongoose.Schema( {
    
    // storing username 
    username: {
      type: String,
      required: true,

    },

    //storing final game score
    score: {
      type: Number,
      required: true,
      min: 0,
      
    },

    // storing date of game scored
    date:{
      type: Date,
      default: Date.now,
    },
  },

  { collection: "HiloScores" }
);

module.exports = mongoose.model("HiloScores", newHiloScoreSchema);