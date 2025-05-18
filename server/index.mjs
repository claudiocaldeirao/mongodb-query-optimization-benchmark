import express from "express";
import { MongoClient } from "mongodb";

const app = express();
const port = 3000;
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/shopDB";

app.get("/", async (req, res) => {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db();
    const count = await db.collection("customers").countDocuments();
    res.send(`Connected to MongoDB. Document count: ${count}`);
  } catch (err) {
    res.status(500).send("Error connecting to MongoDB: " + err.message);
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
