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

// TESTCASE 1
// Wszystkie dane z kolekcji psów.
async function testCase1Mongo(req, res) {
  try {
    const collection = db.collection("dogs");
    const dogs = await collection.find().toArray();
    return({ message: "Wszytskie pieski", dogs });
  } catch (err) {
    console.error("Błąd podczas pobierania danych psów:", err);
  }
}

router.get("/mongodb/dogs", async (req, res, next) => {
  try {
    const data = await testCase1Mongo();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TESTCASE 2
// Wszystkie dane z kolekcji ras.
async function testCase2Mongo() {
  try {
    const collection = db.collection("breeds");
    const breeds = await collection.find().toArray();
    return({ message: "Wszytskie rasy", breeds });
  } catch (err) {
    console.error("Błąd podczas pobierania danych ras:", err);
  }
}
router.get("/mongodb/breeds", async (req, res, next) => {
  try {
    const data = await testCase2Mongo();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- SELECTY Z WARUNKAMI --

// TESTCASE 3
// Pobieranie psów o określonym kolorze
async function testCase3Mongo(color = "BROWN") {
  try {
    const collection = db.collection("dogs");
    const dogs = await collection.find({ color: color.toUpperCase() }).toArray();
    return({ message: `Psy o kolorze ${color}`, dogs });
  } catch (err) {
    console.error(`Błąd podczas pobierania psów o kolorze ${color}:`, err);
  }
}

router.get("/mongodb/dogs/color/:color", async (req, res, next) => {
  const { color } = req.params;
  try {
    const data = await testCase3Mongo(color);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TESTCASE 4
// Pobieranie adopcji po określonej dacie
async function testCase4Mongo(date = "01/22/2008") {
  try {
    const collection = db.collection("dogs");
    const adoptions = await collection.find({ adoption_date: { $gt: date } }).toArray();
    return({ message: `Adopcje po ${date}`, adoptions });
  } catch (err) {
    console.error(`Błąd podczas pobierania adopcji po ${date}:`, err);
  }
}
router.get("/mongodb/adoptions/date/:date", async (req, res, next) => {
  const date = new Date(req.params.date);
  try {
    const data = await testCase4Mongo(date);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- SELECTY Z ŁĄCZENIEM TABEL --

// TODO: Fix !!!!!

// TESTCASE 5
// Pobieranie imion psów i nazw ras
async function testCase5Mongo() {
  try {
    const dogsBreeds = await Dog.aggregate([
      {
        $lookup: {
          from: "breeds",
          localField: "breed_id",
          foreignField: "breed_id",
          as: "breed_info"
        }
      },
      {
        $project: {
          "dog_name": 1,
          "breed_name": "$breed_info.breed_name"
        }
      }
    ]);
    return({ message: "Imiona psów i nazwy ras", data: dogsBreeds });
  } catch (err) {
    console.error("Błąd podczas pobierania imion psów i nazw ras:", err);
  }
}
router.get("/mongodb/dogs-breeds", async (req, res, next) => {
  try {
    const data = await testCase5Mongo();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TESTCASE 6
// Pobieranie psów o rasach pochodzących z USA
async function testCase6Mongo() {
  try {
    const collection = db.collection("breeds");
    const dogsCollection = db.collection("dogs");
    const usaBreeds = await collection.find({ country_of_origin: "ST" });
    const usaBreedsIds = usaBreeds.map(breed => breed.breed_id);
    const usaDogs = await dogsCollection.find({ breed_id: { $in: usaBreedsIds } });
    console.log("Psy o rasach pochodzących z USA", usaDogs)
    return({ message: "Psy o rasach pochodzących z USA", data: usaDogs });
  } catch (err) {
    console.error("Błąd podczas pobierania psów o rasach pochodzących z USA:", err);
  }
}
router.get("/mongodb/dogs-usa-breeds", async (req, res, next) => {
  try {
    const data = await testCase6Mongo();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- SELECT Z GRUPOWANIEM I FUNKCJAMI AGREGUJĄCYMI --

// TEST CASE 7
// Pobieranie liczby psów dla każdej rasy, które mają więcej niż 5 osobników
async function testCase7Mongo() {
  try {
    const collection = db.collection("dogs");
    const dogsCountByBreed = await collection.aggregate([
      {
        $group: {
          _id: "$breed_id",
          total_dogs: { $sum: 1 }
        }
      },
      {
        $match: {
          total_dogs: { $gt: 5 }
        }
      }
    ]);
    return({ message: "Liczba psów dla każdej rasy, która ma więcej niż 5 osobników", data: dogsCountByBreed });
  } catch (err) {
    console.error("Błąd podczas pobierania liczby psów dla każdej rasy:", err);
  }
}
router.get("/mongodb/dogs-count-by-breed", async (req, res, next) => {
  try {
    const data = await testCase7Mongo();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- AKTUALIZACJA --

// TEST CASE 8
// Aktualizacja wagi psa o podanym id
async function testCase8Mongo(dogId = 1308, newWeight = 20) {
  const collection = db.collection("dogs");

  try {
    await collection.findOneAndUpdate({ dogId: dogId }, { $set: { weight: newWeight } });
    return({ message: "Zaktualizowano wagę psa", dogId });
  } catch (err) {
    console.error("Błąd podczas aktualizacji wagi psa:", err);
  }
}
router.put("/mongodb/dogs/:id/weight/:weight", async (req, res, next) => {
  const dogId = req.params.id;
  const newWeight = req.params.weight;
  try {
    const data = await testCase8Mongo(dogId, newWeight);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// TEST CASE 9
// Aktualizacja daty adopcji dla konkretnego psa i właściciela
async function testCase9Mongo(ownerId = 13, dogId = 2584, newAdoptionDate = "07/28/2010") {
  try {
    const collection = db.collection("adoptions");
    await collection.updateOne({ owner_id: ownerId, dog_id: dogId }, { $set: { adoption_date: newAdoptionDate } });
    return({ message: "Zaktualizowano datę adopcji dla psa i właściciela", ownerId, dogId });
  } catch (err) {
    console.error("Błąd podczas aktualizacji daty adopcji dla psa i właściciela:", err);
  }
}
router.put("/mongodb/adoptions/:ownerId/:dogId/adoption-date", async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const dogId = req.params.dogId;
  const newAdoptionDate = req.body.adoption_date;
  try {
    const data = await testCase9Mongo(ownerId, dogId, newAdoptionDate);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export {testCase1Mongo, testCase2Mongo, testCase3Mongo, testCase4Mongo, testCase5Mongo, testCase6Mongo, testCase7Mongo, testCase8Mongo, testCase9Mongo}