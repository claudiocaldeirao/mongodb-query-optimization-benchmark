import express from "express";
import { MongoClient } from "mongodb";
import { BadAggregation } from "./stages/stage01.mjs";
import { ImpprovedAggregation } from "./stages/stage02.mjs";
import { AggregationWithIndex } from "./stages/stage03.mjs";
import { DenormalizedAggregation } from "./stages/stage04.mjs";

const app = express();
const port = 3000;
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";

const stages = {
  1: BadAggregation,
  2: ImpprovedAggregation,
  3: AggregationWithIndex,
  4: DenormalizedAggregation,
};

const databases = {
  1: "stage01",
  2: "stage02",
  3: "stage03",
  4: "stage04",
};

app.get("/orders/:customerId", async (req, res) => {
  const client = new MongoClient(mongoUri);
  const stageIndex = req.query.stage || 1;
  const dbName = databases[stageIndex];

  const customerIdBase64 = req.params.customerId;
  const customerId = Buffer.from(customerIdBase64, "base64");

  try {
    await client.connect();
    const db = client.db(dbName);
    const docs = await stages[stageIndex](db, customerId);
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
