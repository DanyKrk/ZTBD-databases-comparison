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
  res.json({ message: "Mongo status", status: result });
});

router.get("/dogs", async (req, res, next) => {
  const collection = await db.collection("dogs");
  const result = await collection.find().toArray();

  res.json({
    message: "Lista psów",
    dogs: result,
  });
});

router.get("/breeds", async (req, res, next) => {
  const collection = await db.collection("breeds");
  const result = await collection.find().toArray();

  res.json({
    message: "Lista ras",
    breeds: result,
  });
});

router.get("/owners", async (req, res, next) => {
  const collection = await db.collection("owners");
  const result = await collection.find().toArray();

  res.json({
    message: "Lista właścicieli",
    owners: result,
  });
});

router.post("/dogs/add", async (req, res, next) => {
  const { dog_name, breed_id, color, weight, birth_date, adopted_date, acquired_date } = req.body;

  const collection = db.collection("dogs");
  const result = await collection.insertOne({
    dog_name,
    breed_id,
    color,
    weight,
    birth_date: new Date(birth_date),
    adopted_date: new Date(adopted_date),
    acquired_date: new Date(acquired_date),
  });

  res.json({
    message: "Dodano psa",
    result: result,
  });
});

router.post("/breeds/add", async (req, res, next) => {
  const { breed_name, lifespan, country_of_origin } = req.body;

  const collection = db.collection("breeds");
  const result = await collection.insertOne({
    breed_name,
    lifespan,
    country_of_origin,
  });

  res.json({
    message: "Dodano rasę",
    result: result,
  });
});

router.post("/owners/add", async (req, res, next) => {
  const { owner_name, owner_surname, telephone_number } = req.body;

  const collection = db.collection("owners");
  const result = await collection.insertOne({
    owner_name,
    owner_surname,
    telephone_number,
  });

  res.json({
    message: "Dodano właściciela",
    result: result,
  });
});
