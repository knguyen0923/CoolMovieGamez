const mongoose = require("mongoose");

//api pull schema/model to pull api data and save it into the database; includes movies and date
const apiPullSchema = new mongoose.Schema(
  {
    movieid: {
        type: String,
        unique: true,
        required: true,
        label: "movieid",
    },
    title: {
      type: String,
      required: false,
      label: "movie",
    },
    originalTitle: {
      type: String,
      required: false,
      label: "originalTitle",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    poster: { //poster of type string as it will be html link
        type: String,
        required: true, 
        label: "poster",
    },
    posterheight: {
        type: Number,
        required: true,
        label: "posterheight",
    },
    posterwidth: {
        type: Number,
        required: true,
        label: "posterwidth",
    },
    rating: {
        type: Number,
        required: true,
        label: "rating",
    },
    votecount: {
        type: Number,
        required: true,
        label: "votecount",
    },
    startYear: {
        type: Number,
        required: true,
        label: "startYear",
    },
    runtimeSeconds: {
        type: Number,
        required: true,
        label: "runtimeSeconds",
    },
    genres: { //several genres for each movie, array of strings
        type: [String],
        required: true,
        label: "genres",
    },
    plot: {
        type: String,
        required: true,
        label: "plot",
    },
    languagecode: {
      type: String,
      required: true,
      label: "languagecode",
    },
    languagename: {
      type: String,
      required: true,
      label: "languagename",
    },
    countrycode: {
      type: String,
      required: true,
      label: "countrycode",
    },
    countryname: {
      type: String,
      required: true,
      label: "countryname",
    },
  },
  { collection: "apiPulls" }
);

module.exports = mongoose.model('apiPulls', apiPullSchema)