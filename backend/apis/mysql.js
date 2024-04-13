import express from "express";
import mysql from "mysql";

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
      const tables = results.map(result => result.Tables_in_your_database_name);
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
      res.json({ message: "MySQL is up and running!", version: results[0].VERSION() });
    }
  });
});

// TESTCASE 1
// Wszystkie dane z tabeli psów.
router.get("/mysql/dogs", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM dogs;");
    res.json({ message: "Wszytskie pieski", dogs: result });
  } catch (err) {
    console.error("Błąd podczas pobierania danych psów:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania danych psów" });
  }
});

// TESTCASE 2
// Wszystkie dane z tabeli ras.
router.get("/mysql/breeds", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM breeds;");
    res.json({ message: "Wszytskie rasy", breeds: result });
  } catch (err) {
    console.error("Błąd podczas pobierania danych ras:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania danych ras" });
  }
});

// -- SELECTY Z WARUNKAMI --

// TESTCASE 3
// Pobieranie psów o określonym kolorze
router.get("/mysql/dogs/color/:color", async (req, res, next) => {
  const color = req.params.color.toUpperCase()
  try {
    const result = await pool.query("SELECT * FROM dogs WHERE color = ?;", [color]);
    res.json({ message: `Psy o kolorze ${color}`, dogs: result });
  } catch (err) {
    console.error(`Błąd podczas pobierania psów o kolorze ${color}:`, err);
    res.status(500).json({ error: `Wystąpił błąd podczas pobierania psów o kolorze ${color}` });
  }
});

// TESTCASE 4
// Pobieranie adopcji po określonej dacie
router.get("/mysql/adoptions/date/:date", async (req, res, next) => {
  const { date } = req.params;
  try {
    const result = await pool.query("SELECT * FROM adoptions WHERE adoption_date > ?;", [date]);
    res.json({ message: `Adopcje po ${date}`, adoptions: result });
  } catch (err) {
    console.error(`Błąd podczas pobierania adopcji po ${date}:`, err);
    res.status(500).json({ error: `Wystąpił błąd podczas pobierania adopcji po ${date}` });
  }
});

// -- SELECTY Z ŁĄCZENIEM TABEL --

// TESTCASE 5
// Pobieranie imion psów i nazw ras
router.get("/mysql/dogs-breeds", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT d.dog_name, b.breed_name FROM dogs d JOIN breeds b ON d.breed_id = b.breed_id;");
    res.json({ message: "Imiona psów i nazwy ras", data: result });
  } catch (err) {
    console.error("Błąd podczas pobierania imion psów i nazw ras:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania imion psów i nazw ras" });
  }
});

// TESTCASE 6
// Pobieranie psów o rasach pochodzących z USA
router.get("/mysql/dogs-usa-breeds", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM dogs WHERE breed_id IN (SELECT breed_id FROM breeds WHERE country_of_origin = 'USA');");
    res.json({ message: "Psy o rasach pochodzących z USA", data: result });
  } catch (err) {
    console.error("Błąd podczas pobierania psów o rasach pochodzących z USA:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania psów o rasach pochodzących z USA" });
  }
});

// -- SELECT Z GRUPOWANIEM I FUNKCJAMI AGREGUJĄCYMI --

// TEST CASE 7
// Pobieranie liczby psów dla każdej rasy, które mają więcej niż 5 osobników
router.get("/mysql/dogs-count-by-breed", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT breed_id, COUNT(*) AS total_dogs FROM dogs GROUP BY breed_id HAVING COUNT(*) > 5;");
    res.json({ message: "Liczba psów dla każdej rasy, która ma więcej niż 5 osobników", data: result });
  } catch (err) {
    console.error("Błąd podczas pobierania liczby psów dla każdej rasy:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania liczby psów dla każdej rasy" });
  }
});

// -- AKTUALIZACJA --

// TEST CASE 8
// Aktualizacja wagi psa o podanym id
router.put("/postgres/dogs/:id/weight/:weight", async (req, res, next) => {
  const dogId = req.params.id;
  const newWeight = req.params.weight;
  try {
    const result = await client.query("UPDATE dogs SET weight = $1 WHERE dog_id = $2;", [newWeight, dogId]);
    res.json({ message: "Zaktualizowano wagę psa", dogId });
  } catch (err) {
    console.error("Błąd podczas aktualizacji wagi psa:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas aktualizacji wagi psa" });
  }
});


// TEST CASE 9
// Aktualizacja daty adopcji dla konkretnego psa i właściciela
router.put("/mysql/adoptions/:ownerId/:dogId/adoption-date", async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const dogId = req.params.dogId;
  const newAdoptionDate = req.body.adoption_date;

  try {
    const result = await pool.query("UPDATE adoptions SET adoption_date = ? WHERE owner_id = ? AND dog_id = ?;", [newAdoptionDate, ownerId, dogId]);
    res.json({ message: "Zaktualizowano datę adopcji dla psa i właściciela", ownerId, dogId });
  } catch (err) {
    console.error("Błąd podczas aktualizacji daty adopcji dla psa i właściciela:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas aktualizacji daty adopcji dla psa i właściciela" });
  }
});
