import express from "express";
import { MongoClient } from "mongodb";
import { BadAggregation } from "./stages/stage01.mjs";

const app = express();
const port = 3000;
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";

app.get("/orders", async (req, res) => {
  const client = new MongoClient(mongoUri);
  const stageIndex = req.params.stage || 1;

  try {
    await client.connect();
    const db = client.db("stage01");
    const docs = await stages[stageIndex](db);
    res.send(docs);
  } catch (err) {
    res.status(500).send("Error connecting to MongoDB: " + err.message);
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});

const stages = {
  1: BadAggregation,
};
