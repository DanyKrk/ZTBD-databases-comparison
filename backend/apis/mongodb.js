import express from "express";
import mongodb from "mongodb";

export const router = express.Router();

const url = "mongodb://root:example@localhost:27017";
const client = new mongodb.MongoClient(url);
const db = client.db("ztbd");

router.get("/mongodb", async (req, res, next) => {
  const result = await db.command({
    listCollections: 1,
    authorizedCollections: true,
    nameOnly: true,
  });

  res.json({
    message: "MongoDB hehe..",
    info: result,
  });
});

router.get("/mongodb/status", async (req, res, next) => {
  const result = await db.command({
    serverStatus: 1,
  });
  res.json({ message: "Jest jak jest", status: result });
});

router.get("/mongodb/company", async (req, res, next) => {
  const collection = await db.collection("indexes");
  const result = await collection.find().toArray();

  res.json({
    message: "Result",
    result: result,
  });
});

router.post("/mongodb/execute", async (req, res, next) => {
  const query = req.body.query;

  let result = "Query/Collection not specified!";
  let status = 500;
  if (query) {
    try {
      // eg. query: `db.collection('indexes').insertOne({index_name: 'test'});
      console.log("Mongo Executing:", query);
      eval(query);
      status = 200;
    } catch (err) {
      result = "Query error. See console.";
      console.log(err);
    }
  }

  res.status(status).json({
    message: result,
  });
});

// TEST CASE 1
router.get("/mongodb/index", async (req, res, next) => {
  const limit = Number(req.query.limit) ?? 100;
  const collection = db.collection("spx_d_data");
  const result = await collection.find().limit(limit).toArray();

  result.forEach((row) => {
    delete row.garbage;
  });

  res.json({
    result: result,
  });
});

// TEST CASE 2
router.get("/mongodb/company/:index", async (req, res, next) => {
  const index = req.params.index;
  const limit = Number(req.query.limit) ?? 100;
  const collection = db.collection(index + "_data");
  const result = await collection.find().limit(limit).toArray();

  result.forEach((row) => {
    delete row.garbage;
  });

  res.json({
    message: index + " index",
    result: result,
  });
});

// TEST CASE 3
router.get("/mongodb/company/:index/sorted", async (req, res, next) => {
  const index = req.params.index;
  const limit = Number(req.query.limit) ?? 100;
  const collection = db.collection(index + "_data");
  const result = await collection
    .find()
    .sort({ day: -1 })
    .limit(limit)
    .toArray();

  result.forEach((row) => {
    delete row.garbage;
  });

  res.json({
    message: index + " index",
    result: result,
  });
});

// TEST CASE 4
router.get("/mongodb/company/:index/avg", async (req, res, next) => {
  const index = req.params.index;

  const collection = db.collection(index + "_data");
  const result = await collection
    .aggregate([
      {
        $group: {
          _id: index,
          avg_closing: { $avg: "$closing" },
          avg_opening: { $avg: "$opening" },
          avg_highest: { $avg: "$highest" },
          avg_lowest: { $avg: "$lowest" },
        },
      },
    ])
    .toArray();

  res.json({
    message: index + " index",
    result: result,
  });
});

// TEST CASE 5
router.get("/mongodb/company/:index/filter", async (req, res, next) => {
  const index = req.params.index;
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;

  const collection = db.collection(index + "_data");
  const result = await collection
    .find({ day: { $gte: new Date(startDate), $lte: new Date(endDate) } })
    .toArray();

  result.forEach((row) => {
    delete row.garbage;
  });

  res.json({
    message: index + " index",
    result: result,
  });
});

// TEST CASE 6
router.post("/mongodb/company/:index/update", async (req, res, next) => {
  const index = req.params.index;

  const date = req.body.date;
  const volume = Number(req.body.volume);

  const collection = db.collection(index + "_data");
  const result = await collection.updateOne(
    { day: new Date(date) },
    { $set: { volume } }
  );

  res.json({
    message: index + " index",
    result: result,
  });
});

// TEST CASE 7
router.delete("/mongodb/company/:index", async (req, res, next) => {
  const index = req.params.index;

  const date = req.query.date;

  const collection = db.collection(index + "_data");
  const result = await collection.deleteOne({ day: new Date(date) });

  res.json({
    message: index + " index",
    result: result,
  });
});

// TEST CASE 8
router.post("/mongodb/company/:index/insert", async (req, res, next) => {
  const index_name = req.params.index;

  const day = req.body.day;
  const volume = req.body.volume;
  const opening = req.body.open;
  const closing = req.body.close;
  const highest = req.body.high;
  const lowest = req.body.low;

  const collection = db.collection(index_name + "_data");
  const result = await collection.insertOne({
    index_name,
    day,
    volume,
    opening,
    closing,
    highest,
    lowest,
  });

  res.json({
    message: index_name + " index",
    result: result,
  });
});
