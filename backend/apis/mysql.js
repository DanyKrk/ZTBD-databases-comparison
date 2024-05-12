import express from "express";
import mysql from "mysql2";

export const router = express.Router();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "DOGS_DATABASE_MYSQL"
});

connection.connect();

router.get("/mysql", (req, res, next) => {
  connection.query(`
    SHOW TABLES;
  `, (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving tables." });
    } else {
      const tables = results.map(result => result);
      res.json({ message: "Available tables", tables: tables });
    }
  });
});

router.get("/mysql/status", (req, res, next) => {
  connection.query("SELECT VERSION()", (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving MySQL version." });
    } else {
      res.json({ message: "MySQL is up and running!", version: results[0]});
    }
  });
});

// TESTCASE 1
// Wszystkie dane z tabeli psów.
async function testCase1MySQL() {
  try {
    const dogs = await Dog.find();
    return { message: "Wszytskie pieski", dogs };
  } catch (err) {
    console.error("Błąd podczas pobierania danych psów:", err);
    throw new Error("Wystąpił błąd podczas pobierania danych psów");
  }
}

router.get("/mysql/dogs", async (req, res, next) => {
  try {
    const data = await testCase1MySQL();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TESTCASE 2
// Wszystkie dane z tabeli ras.
async function testCase2MySQL() {
  try {
    const breeds = await Breed.find();
    return { message: "Wszytskie rasy", breeds };
  } catch (err) {
    console.error("Błąd podczas pobierania danych ras:", err);
    throw new Error("Wystąpił błąd podczas pobierania danych ras");
  }
}

router.get("/mongodb/breeds", async (req, res, next) => {
  try {
    const data = await testCase2MySQL();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- SELECTY Z WARUNKAMI --

// TESTCASE 3
// Pobieranie psów o określonym kolorze
async function testCase3MySQL(color) {
  try {
    const dogs = await Dog.find({ color: color.toUpperCase() });
    return { message: `Psy o kolorze ${color}`, dogs };
  } catch (err) {
    console.error(`Błąd podczas pobierania psów o kolorze ${color}:`, err);
    throw new Error(`Wystąpił błąd podczas pobierania psów o kolorze ${color}`);
  }
}

router.get("/mongodb/dogs/color/:color", async (req, res, next) => {
  const color = req.params.color;
  try {
    const data = await testCase3MySQL(color);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TESTCASE 4
// Pobieranie adopcji po określonej dacie
async function testCase4MySQL(date) {
  try {
    const adoptions = await Adoption.find({ adoption_date: { $gt: date } });
    return { message: `Adopcje po ${date}`, adoptions };
  } catch (err) {
    console.error(`Błąd podczas pobierania adopcji po ${date}:`, err);
    throw new Error(`Wystąpił błąd podczas pobierania adopcji po ${date}`);
  }
}

router.get("/mongodb/adoptions/date/:date", async (req, res, next) => {
  const date = req.params.date;
  try {
    const data = await testCase4MySQL(date);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- SELECTY Z ŁĄCZENIEM TABEL --

// TEST CASE 5
// Pobieranie imion psów i nazw ras
async function testCase5MySQL() {
  try {
    const result = await pool.query("SELECT d.dog_name, b.breed_name FROM dogs d JOIN breeds b ON d.breed_id = b.breed_id;");
    return { message: "Imiona psów i nazwy ras", data: result };
  } catch (err) {
    console.error("Błąd podczas pobierania imion psów i nazw ras:", err);
    throw new Error("Wystąpił błąd podczas pobierania imion psów i nazw ras");
  }
}

router.get("/mysql/dogs-breeds", async (req, res, next) => {
  try {
    const data = await testCase5MySQL();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TEST CASE 6
// Pobieranie psów o rasach pochodzących z USA
async function testCase6MySQL() {
  try {
    const result = await pool.query("SELECT * FROM dogs WHERE breed_id IN (SELECT breed_id FROM breeds WHERE country_of_origin = 'USA');");
    return { message: "Psy o rasach pochodzących z USA", data: result };
  } catch (err) {
    console.error("Błąd podczas pobierania psów o rasach pochodzących z USA:", err);
    throw new Error("Wystąpił błąd podczas pobierania psów o rasach pochodzących z USA");
  }
}

router.get("/mysql/dogs-usa-breeds", async (req, res, next) => {
  try {
    const data = await testCase6MySQL();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- SELECT Z GRUPOWANIEM I FUNKCJAMI AGREGUJĄCYMI --

// TEST CASE 7
// Pobieranie liczby psów dla każdej rasy, które mają więcej niż 5 osobników
async function testCase7MySQL() {
  try {
    const result = await pool.query("SELECT breed_id, COUNT(*) AS total_dogs FROM dogs GROUP BY breed_id HAVING COUNT(*) > 5;");
    return { message: "Liczba psów dla każdej rasy, która ma więcej niż 5 osobników", data: result };
  } catch (err) {
    console.error("Błąd podczas pobierania liczby psów dla każdej rasy:", err);
    throw new Error("Wystąpił błąd podczas pobierania liczby psów dla każdej rasy");
  }
}

router.get("/mysql/dogs-count-by-breed", async (req, res, next) => {
  try {
    const data = await testCase7MySQL();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- AKTUALIZACJA --

// TEST CASE 8
// Aktualizacja wagi psa o podanym id
async function testCase8MySQL(dogId, newWeight) {
  try {
    const result = await Dog.updateOne({ _id: dogId }, { $set: { weight: newWeight } });
    if (result.nModified === 1) {
      return { message: "Zaktualizowano wagę psa", dogId };
    } else {
      throw new Error("Nie udało się zaktualizować wagi psa");
    }
  } catch (err) {
    console.error("Błąd podczas aktualizacji wagi psa:", err);
    throw new Error("Wystąpił błąd podczas aktualizacji wagi psa");
  }
}

router.put("/mongodb/dogs/:id/weight/:weight", async (req, res, next) => {
  const dogId = req.params.id;
  const newWeight = req.params.weight;
  try {
    const data = await testCase8MySQL(dogId, newWeight);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TEST CASE 9
// Aktualizacja daty adopcji dla konkretnego psa i właściciela
async function testCase9MySQL(ownerId, dogId, newAdoptionDate) {
  try {
    const result = await Adoption.updateOne({ ownerId: ownerId, dogId: dogId }, { $set: { adoptionDate: newAdoptionDate } });
    if (result.nModified === 1) {
      return { message: "Zaktualizowano datę adopcji dla psa i właściciela", ownerId, dogId };
    } else {
      throw new Error("Nie udało się zaktualizować daty adopcji");
    }
  } catch (err) {
    console.error("Błąd podczas aktualizacji daty adopcji dla psa i właściciela:", err);
    throw new Error("Wystąpił błąd podczas aktualizacji daty adopcji dla psa i właściciela");
  }
}

router.put("/mongodb/adoptions/:ownerId/:dogId/adoption-date", async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const dogId = req.params.dogId;
  const newAdoptionDate = req.body.adoption_date;
  try {
    const data = await testCase9MySQL(ownerId, dogId, newAdoptionDate);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export {testCase1MySQL, testCase2MySQL, testCase3MySQL, testCase4MySQL, testCase5MySQL, testCase6MySQL, testCase7MySQL, testCase8MySQL, testCase9MySQL}