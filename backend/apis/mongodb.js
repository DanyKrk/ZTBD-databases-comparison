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
router.get("/mongodb/dogs", async (req, res, next) => {
  try {
    const dogs = await Dog.find();
    res.json({ message: "Wszytskie pieski", dogs });
  } catch (err) {
    console.error("Błąd podczas pobierania danych psów:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania danych psów" });
  }
});

// TESTCASE 2
// Wszystkie dane z kolekcji ras.
router.get("/mongodb/breeds", async (req, res, next) => {
  try {
    const breeds = await Breed.find();
    res.json({ message: "Wszytskie rasy", breeds });
  } catch (err) {
    console.error("Błąd podczas pobierania danych ras:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania danych ras" });
  }
});

// -- SELECTY Z WARUNKAMI --

// TESTCASE 3
// Pobieranie psów o określonym kolorze
router.get("/mongodb/dogs/color/:color", async (req, res, next) => {
  const color = req.params.color.toLowerCase();
  try {
    const dogs = await Dog.find({ color: color });
    res.json({ message: `Psy o kolorze ${color}`, dogs });
  } catch (err) {
    console.error(`Błąd podczas pobierania psów o kolorze ${color}:`, err);
    res.status(500).json({ error: `Wystąpił błąd podczas pobierania psów o kolorze ${color}` });
  }
});

// TESTCASE 4
// Pobieranie adopcji po określonej dacie
router.get("/mongodb/adoptions/date/:date", async (req, res, next) => {
  const date = new Date(req.params.date);
  try {
    const adoptions = await Adoption.find({ adoption_date: { $gt: date } });
    res.json({ message: `Adopcje po ${date.toISOString()}`, adoptions });
  } catch (err) {
    console.error(`Błąd podczas pobierania adopcji po ${date}:`, err);
    res.status(500).json({ error: `Wystąpił błąd podczas pobierania adopcji po ${date}` });
  }
});

// -- SELECTY Z ŁĄCZENIEM TABEL --

// TESTCASE 5
// Pobieranie imion psów i nazw ras
router.get("/mongodb/dogs-breeds", async (req, res, next) => {
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
    res.json({ message: "Imiona psów i nazwy ras", data: dogsBreeds });
  } catch (err) {
    console.error("Błąd podczas pobierania imion psów i nazw ras:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania imion psów i nazw ras" });
  }
});

// TESTCASE 6
// Pobieranie psów o rasach pochodzących z USA
router.get("/mongodb/dogs-usa-breeds", async (req, res, next) => {
  try {
    const usaBreeds = await Breed.find({ country_of_origin: "USA" });
    const usaBreedsIds = usaBreeds.map(breed => breed.breed_id);
    const usaDogs = await Dog.find({ breed_id: { $in: usaBreedsIds } });
    res.json({ message: "Psy o rasach pochodzących z USA", data: usaDogs });
  } catch (err) {
    console.error("Błąd podczas pobierania psów o rasach pochodzących z USA:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania psów o rasach pochodzących z USA" });
  }
});

// -- SELECT Z GRUPOWANIEM I FUNKCJAMI AGREGUJĄCYMI --

// TEST CASE 7
// Pobieranie liczby psów dla każdej rasy, które mają więcej niż 5 osobników
router.get("/mongodb/dogs-count-by-breed", async (req, res, next) => {
  try {
    const dogsCountByBreed = await Dog.aggregate([
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
    res.json({ message: "Liczba psów dla każdej rasy, która ma więcej niż 5 osobników", data: dogsCountByBreed });
  } catch (err) {
    console.error("Błąd podczas pobierania liczby psów dla każdej rasy:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania liczby psów dla każdej rasy" });
  }
});

// -- AKTUALIZACJA --

// TEST CASE 8
// Aktualizacja wagi psa o podanym id
router.put("/mongodb/dogs/:id/weight/:weight", async (req, res, next) => {
  const dogId = req.params.id;
  const newWeight = req.params.weight;
  try {
    await Dog.findByIdAndUpdate(dogId, { $set: { weight: newWeight } });
    res.json({ message: "Zaktualizowano wagę psa", dogId });
  } catch (err) {
    console.error("Błąd podczas aktualizacji wagi psa:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas aktualizacji wagi psa" });
  }
});


// TEST CASE 9
// Aktualizacja daty adopcji dla konkretnego psa i właściciela
router.put("/mongodb/adoptions/:ownerId/:dogId/adoption-date", async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const dogId = req.params.dogId;
  const newAdoptionDate = req.body.adoption_date;

  try {
    await Adoption.updateOne({ owner_id: ownerId, dog_id: dogId }, { $set: { adoption_date: newAdoptionDate } });
    res.json({ message: "Zaktualizowano datę adopcji dla psa i właściciela", ownerId, dogId });
  } catch (err) {
    console.error("Błąd podczas aktualizacji daty adopcji dla psa i właściciela:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas aktualizacji daty adopcji dla psa i właściciela" });
  }
});
