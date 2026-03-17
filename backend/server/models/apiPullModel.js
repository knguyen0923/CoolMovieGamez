const mongoose = require("mongoose");

//api pull schema/model to pull api data and save it into the database; includes movies and date
const apiPullSchema = new mongoose.Schema(
  {
    movie: {
      type: String,
      required: true,
      label: "username",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    poster: { //poster of type string as it will be html link
        type: String,
        required: false, 
        label: "poster",
    },
    countrycode: {
        type: String,
        required: true, 
        label: "country-code",
    },
    rating: {
        type: number,
        votecount: number, 
        required: false,
        label: "rating",
    },

  },
  { collection: "apiPulls" }
);

module.exports = mongoose.model('apiPulls', apiPullSchema)