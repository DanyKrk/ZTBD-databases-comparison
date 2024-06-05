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
async function testCase1Postgres() {
  try {
    const result = await client.query("SELECT * FROM dogs;");
    return { message: "Wszytskie pieski", dogs: result.rows };
  } catch (err) {
    console.error("Błąd podczas pobierania danych psów:", err);
    throw new Error("Wystąpił błąd podczas pobierania danych psów");
  }
}
router.get("/postgres/dogs", async (req, res, next) => {
  try {
    const data = await testCase1Postgres();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TEST CASE 2
// Wszystkie dane z tabeli ras.
async function testCase2Postgres() {
  try {
    const result = await client.query("SELECT * FROM breeds;");
    return { message: "Wszytskie rasy", breeds: result.rows };
  } catch (err) {
    console.error("Błąd podczas pobierania danych ras:", err);
    throw new Error("Wystąpił błąd podczas pobierania danych ras");
  }
}

router.get("/postgres/breeds", async (req, res, next) => {
  try {
    const data = await testCase2Postgres();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- SELECTY Z WARUNKAMI -- 

// TEST CASE 3
// Pobieranie psów o określonym kolorze
async function testCase3Postgres(color = "BROWN") {
  try {
    const result = await client.query("SELECT * FROM dogs WHERE color = $1;", [color.toUpperCase()]);
    return { message: `Psy o kolorze ${color}`, dogs: result.rows };
  } catch (err) {
    console.error(`Błąd podczas pobierania psów o kolorze ${color}:`, err);
    throw new Error(`Wystąpił błąd podczas pobierania psów o kolorze ${color}`);
  }
}

router.get("/postgres/dogs/color/:color", async (req, res, next) => {
  const { color } = req.params;
  try {
    const data = await testCase3Postgres(color);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TEST CASE 4
// Pobieranie adopcji po określonej dacie
async function testCase4Postgres(date = "2008-01-22") {
  try {
    const result = await client.query("SELECT * FROM adoptions WHERE adoption_date > $1;", [date]);
    return { message: `Adopcje po ${date}`, adoptions: result.rows };
  } catch (err) {
    console.error(`Błąd podczas pobierania adopcji po ${date}:`, err);
    throw new Error(`Wystąpił błąd podczas pobierania adopcji po ${date}`);
  }
}

router.get("/postgres/adoptions/date/:date", async (req, res, next) => {
  const { date } = req.params;
  try {
    const data = await testCase4Postgres(date);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -- SELECTY Z ŁĄCZENIEM TABEL -- 

/// TEST CASE 5
// Pobieranie imion psów i nazw ras
async function testCase5Postgres() {
  try {
    const result = await client.query("SELECT d.dog_name, b.breed_name FROM dogs d JOIN breeds b ON d.breed_id = b.breed_id;");
    return { message: "Imiona psów i nazwy ras", data: result.rows };
  } catch (err) {
    console.error("Błąd podczas pobierania imion psów i nazw ras:", err);
    throw new Error("Wystąpił błąd podczas pobierania imion psów i nazw ras");
  }
}

router.get("/postgres/dogs-breeds", async (req, res, next) => {
  try {
    const data = await testCase5Postgres();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TEST CASE 6
// Pobieranie psów o rasach pochodzących z USA
async function testCase6Postgres() {
  try {
    const result = await client.query("SELECT * FROM dogs WHERE breed_id IN (SELECT breed_id FROM breeds WHERE country_of_origin = 'ST');");
    return { message: "Psy o rasach pochodzących z USA", data: result.rows };
  } catch (err) {
    console.error("Błąd podczas pobierania psów o rasach pochodzących z USA:", err);
    throw new Error("Wystąpił błąd podczas pobierania psów o rasach pochodzących z USA");
  }
}

router.get("/postgres/dogs-usa-breeds", async (req, res, next) => {
  try {
    const data = await testCase6Postgres();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- SELECT Z GRUPOWANIEM I FUNKCJAMI AGREGUJĄCYMI --

// TEST CASE 7
// Pobieranie liczby psów dla każdej rasy, które mają więcej niż 5 osobników
async function testCase7Postgres() {
  try {
    const result = await client.query("SELECT breed_id, COUNT(*) AS total_dogs FROM dogs GROUP BY breed_id HAVING COUNT(*) > 5;");
    return { message: "Liczba psów dla każdej rasy, która ma więcej niż 5 osobników", data: result.rows };
  } catch (err) {
    console.error("Błąd podczas pobierania liczby psów dla każdej rasy:", err);
    throw new Error("Wystąpił błąd podczas pobierania liczby psów dla każdej rasy");
  }
}

router.get("/postgres/dogs-count-by-breed", async (req, res, next) => {
  try {
    const data = await testCase7Postgres();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- AKTUALIZACJA --

// TEST CASE 8
// Aktualizacja wagi psa o podanym id
async function testCase8Postgres(dogId = 1308, newWeight = 20) {
  try {
    const result = await client.query("UPDATE dogs SET weight = $1 WHERE dog_id = $2;", [newWeight, dogId]);
    return { message: "Zaktualizowano wagę psa", dogId };
  } catch (err) {
    console.error("Błąd podczas aktualizacji wagi psa:", err);
    throw new Error("Wystąpił błąd podczas aktualizacji wagi psa");
  }
}

router.put("/postgres/dogs/:id/weight/:weight", async (req, res, next) => {
  const dogId = req.params.id;
  const newWeight = req.params.weight;
  try {
    const data = await testCase8Postgres(dogId, newWeight);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TEST CASE 9
// Aktualizacja daty adopcji dla konkretnego psa i właściciela
async function testCase9Postgres(ownerId = 13, dogId = 2584, newAdoptionDate = "07/28/2010") {
  try {
    const result = await client.query("UPDATE adoptions SET adoption_date = $1 WHERE owner_id = $2 AND dog_id = $3;", [newAdoptionDate, ownerId, dogId]);
    return { message: "Zaktualizowano datę adopcji dla psa i właściciela", ownerId, dogId };
  } catch (err) {
    console.error("Błąd podczas aktualizacji daty adopcji dla psa i właściciela:", err);
    throw new Error("Wystąpił błąd podczas aktualizacji daty adopcji dla psa i właściciela");
  }
}

router.put("/postgres/adoptions/:ownerId/:dogId/adoption-date", async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const dogId = req.params.dogId;
  const newAdoptionDate = req.body.adoption_date;
  try {
    const data = await testCase9Postgres(ownerId, dogId, newAdoptionDate);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { testCase1Postgres, testCase2Postgres, testCase3Postgres, testCase4Postgres, testCase5Postgres, testCase6Postgres, testCase7Postgres, testCase8Postgres, testCase9Postgres };