const mongoose = require("mongoose");

const GuardianSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  type: {
    type: String,
  },
  sectionId: {
    type: String,
  },
  sectionName: {
    type: String,
  },
  webPublicationDate: {
    type: Date,
  },
  webTitle: {
    type: String,
  },
  webUrl: {
    type: String,
  },
  apiUrl: {
    type: String,
  },
  isHosted: {
    type: String,
  },
  pillarId: {
    type: String,
  },
  pillarName: {
    type: String,
  },
  name: {
    type: String,
  },
});

module.exports = mongoose.model("Guardian", GuardianSchema);
