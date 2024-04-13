import express from "express";
import pg from "pg";

export const router = express.Router();
const client = new pg.Client({ user: "postgres", password: "password" });

await client.connect();

router.get("/postgres", async (req, res, next) => {
  const result = await client.query(`
        SELECT
            table_schema || '.' || table_name
        FROM
            information_schema.tables
        WHERE
            table_type = 'BASE TABLE'
        AND
            table_schema NOT IN ('pg_catalog', 'information_schema')
    `);
  res.json({ message: "Dostępne tabelki", tables: result.rows });
});

router.get("/postgres/status", async (req, res, next) => {
  const result = await client.query("SELECT version()");
  res.json({ message: "Postgres, it's a classic!", version: result });
});

// TESTCASE 1
// Wszystkie dane z tabeli psów.
router.get("/postgres/dogs", async (req, res, next) => {
  const result = await client.query("SELECT * FROM dogs;");
  res.json({ message: "Wszytskie pieski", version: result });
});

// TESTCASE 2
// Wszystkie dane z tabeli ras.
router.get("/postgres/breeds", async (req, res, next) => {
  const result = await client.query("SELECT * FROM breeds;");
  res.json({ message: "Wszytskie rasy", version: result });
});

// -- SELECTY Z WARUNKAMI -- 

// TESTCASE 3
// Pobieranie psów o określonym kolorze
router.get("/postgres/dogs/color/:color", async (req, res, next) => {
  const color = req.params.color.toUpperCase()
  try {
    const result = await client.query("SELECT * FROM dogs WHERE color = $1;", [color]);
    res.json({ message: `Psy o kolorze ${color}`, dogs: result.rows });
  } catch (err) {
    console.error(`Błąd podczas pobierania psów o kolorze ${color}:`, err);
    res.status(500).json({ error: `Wystąpił błąd podczas pobierania psów o kolorze ${color}` });
  }
});

// TEST CASE 4
// Pobieranie adopcji po określonej dacie
router.get("/postgres/adoptions/date/:date", async (req, res, next) => {
  const { date } = req.params;
  try {
    const result = await client.query("SELECT * FROM adoptions WHERE adoption_date > $1;", [date]);
    res.json({ message: `Adopcje po ${date}`, adoptions: result.rows });
  } catch (err) {
    console.error(`Błąd podczas pobierania adopcji po ${date}:`, err);
    res.status(500).json({ error: `Wystąpił błąd podczas pobierania adopcji po ${date}` });
  }
});

// -- SELECTY Z ŁĄCZENIEM TABEL -- 

// TEST CASE 5
// Pobieranie imion psów i nazw ras
router.get("/postgres/dogs-breeds", async (req, res, next) => {
  try {
    const result = await client.query("SELECT d.dog_name, b.breed_name FROM dogs d JOIN breeds b ON d.breed_id = b.breed_id;");
    res.json({ message: "Imiona psów i nazwy ras", data: result.rows });
  } catch (err) {
    console.error("Błąd podczas pobierania imion psów i nazw ras:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania imion psów i nazw ras" });
  }
});

// TEST CASE 6
// Pobieranie psów o rasach pochodzących z USA
router.get("/postgres/dogs-usa-breeds", async (req, res, next) => {
  try {
    const result = await client.query("SELECT * FROM dogs WHERE breed_id IN (SELECT breed_id FROM breeds WHERE country_of_origin = 'USA');");
    res.json({ message: "Psy o rasach pochodzących z USA", data: result.rows });
  } catch (err) {
    console.error("Błąd podczas pobierania psów o rasach pochodzących z USA:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania psów o rasach pochodzących z USA" });
  }
});

// -- SELECT Z GRUPOWANIEM I FUNKCJAMI AGREGUJĄCYMI --

// TEST CASE 7
// Pobieranie liczby psów dla każdej rasy, które mają więcej niż 5 osobników
router.get("/postgres/dogs-count-by-breed", async (req, res, next) => {
  try {
    const result = await client.query("SELECT breed_id, COUNT(*) AS total_dogs FROM dogs GROUP BY breed_id HAVING COUNT(*) > 5;");
    res.json({ message: "Liczba psów dla każdej rasy, która ma więcej niż 5 osobników", data: result.rows });
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
router.put("/postgres/adoptions/:ownerId/:dogId/adoption-date", async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const dogId = req.params.dogId;
  const newAdoptionDate = req.body.adoption_date;

  try {
    const result = await client.query("UPDATE adoptions SET adoption_date = $1 WHERE owner_id = $2 AND dog_id = $3;", [newAdoptionDate, ownerId, dogId]);
    res.json({ message: "Zaktualizowano datę adopcji dla psa i właściciela", ownerId, dogId });
  } catch (err) {
    console.error("Błąd podczas aktualizacji daty adopcji dla psa i właściciela:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas aktualizacji daty adopcji dla psa i właściciela" });
  }
});
