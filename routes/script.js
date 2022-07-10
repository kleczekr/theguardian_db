const express = require("express");
const { MongoClient } = require("mongodb");
const router = express.Router();
const client = new MongoClient(process.env.MONGO_URI);
const NodeCache = require("node-cache");
const Guardian = require("../models/Guardian");

// stdTTL is the default time-to-live for each cache entry
const myCache = new NodeCache({ stdTTL: 3600 });

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
  } catch (err) {
    console.error(err);
  }
}

run();

module.exports = router;
