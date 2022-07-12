const express = require("express");
const { MongoClient } = require("mongodb");
const router = express.Router();
const client = new MongoClient(process.env.MONGO_URI);
const NodeCache = require("node-cache");
// const Guardian = require("../models/Guardian");
const Input = require("../models/Input");

// stdTTL is the default time-to-live for each cache entry
const myCache = new NodeCache({ stdTTL: 86400 });

// function to generate an array
// of all the values
async function run() {
  try {
    await client.connect();
    const database = client.db("theguardian");
    const guardian_col = database.collection("guardian");
    const guardian_prod = guardian_col.find({});
    let guardian = await guardian_prod.toArray();

    console.log(guardian);

    return guardian;
  } catch (err) {
    console.error(err);
  }
}

// @desc    Show all articles
// @route   GET /
router.get("/", async (req, res) => {
  try {
    res.render("index");
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc    Generate an accessible JSON with data for map
// @route   GET /locationId
router.get("/guardian/json", async function (req, res) {
  let all_articles = myCache.get("allArticles");

  // if there was no order information in the cache, connect
  // to the database and update cache
  if (all_articles == null) {
    all_articles = await run();
    // we set time_to_live for cached info for one day
    myCache.set("allArticles", all_articles, 86400);
  }
  var data = all_articles;
  res.send(data);
});

// @desc    Process the add form
// @route   POST /notes
router.post("/", async (req, res) => {
  try {
    // req.body.user = req.user.id;
    console.log(req.body);
    await Input.create(req.body);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

module.exports = router;
