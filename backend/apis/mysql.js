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
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM dogs", (error, results, fields) => {
      if (error) {
        console.error("Error retrieving dogs from MySQL:", error);
        reject("Error retrieving dogs from MySQL");
      } else {
        resolve(results);
      }
    });
  });
}

router.get("/mysql/dogs", async (req, res, next) => {
  try {
    const dogs = await testCase1MySQL();
    res.json({ message: "All dogs from MySQL", dogs: dogs });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// TESTCASE 2
// Wszystkie dane z tabeli ras.
async function testCase2MySQL() {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM breeds", (error, results, fields) => {
      if (error) {
        console.error("Error retrieving breeds from MySQL:", error);
        reject("Error retrieving breeds from MySQL");
      } else {
        resolve(results);
      }
    });
  });
}

router.get("/mysql/breeds", async (req, res, next) => {
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
async function testCase3MySQL(color = "BROWN") {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM dogs WHERE color = ?", [color.toUpperCase()], (error, results, fields) => {
      if (error) {
        console.error(`Error retrieving dogs with color ${color} from MySQL:`, error);
        reject(`Error retrieving dogs with color ${color} from MySQL`);
      } else {
        resolve(results);
      }
    });
  });
}

router.get("/mysql/dogs/color/:color", async (req, res, next) => {
  const { color } = req.params;
  try {
    const dogs = await testCase3MySQL(color);
    res.json({ message: `Dogs with color ${color} from MySQL`, dogs: dogs });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// TESTCASE 4
// Pobieranie adopcji po określonej dacie
async function testCase4MySQL(date = "2008-01-22") {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM adoptions WHERE adoption_date > ?", [date], (error, results, fields) => {
      if (error) {
        console.error(`Error retrieving adoptions after ${date} from MySQL:`, error);
        reject(`Error retrieving adoptions after ${date} from MySQL`);
      } else {
        resolve(results);
      }
    });
  });
}

router.get("/mysql/adoptions/date/:date", async (req, res, next) => {
  const { date } = req.params;
  try {
    const adoptions = await testCase4MySQL(date);
    res.json({ message: `Adoptions after ${date} from MySQL`, adoptions: adoptions });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// -- SELECTY Z ŁĄCZENIEM TABEL --

// TEST CASE 5
// Pobieranie imion psów i nazw ras
async function testCase5MySQL() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT dogs.dog_name, breeds.breed_name 
      FROM dogs 
      JOIN breeds ON dogs.breed_id = breeds.breed_id;
    `;
    connection.query(query, (error, results) => {
      if (error) {
        console.error("Error retrieving dog names and breed names from MySQL:", error);
        reject("An error occurred while retrieving dog names and breed names");
      } else {
        resolve({ message: "Dog names and breed names", data: results });
      }
    });
  });
}

router.get("/mysql/dogs-breeds", async (req, res, next) => {
  try {
    const data = await testCase5MySQL();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// TEST CASE 6
// Pobieranie psów o rasach pochodzących z USA
async function testCase6MySQL() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *
      FROM dogs
      WHERE breed_id = ANY (
        SELECT breed_id
        FROM breeds
        WHERE country_of_origin = 'ST'
      );
    `;
    connection.query(query, (error, rows) => {
      if (error) {
        console.error("Error retrieving dogs with breeds originating from USA:", error);
        reject("An error occurred while retrieving dogs with breeds originating from USA");
      } else {
        resolve({ message: "Dogs with breeds originating from USA", data: rows });
      }
    });
  });
}

router.get("/mysql/dogs-usa-breeds", async (req, res, next) => {
  try {
    const data = await testCase6MySQL();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});


// -- SELECT Z GRUPOWANIEM I FUNKCJAMI AGREGUJĄCYMI --

// TEST CASE 7
// Pobieranie liczby psów dla każdej rasy, które mają więcej niż 5 osobników
async function testCase7MySQL() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT breed_id, COUNT(*) AS total_dogs 
      FROM dogs 
      GROUP BY breed_id 
      HAVING COUNT(*) > 5;
    `;
    connection.query(query, (error, rows) => {
      if (error) {
        console.error("Error retrieving the number of dogs for each breed:", error);
        reject("An error occurred while retrieving the number of dogs for each breed");
      } else {
        resolve({ message: "Number of dogs for each breed with more than 5 individuals", data: rows });
      }
    });
  });
}

router.get("/mysql/dogs-count-by-breed", async (req, res, next) => {
  try {
    const data = await testCase7MySQL();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});


// -- AKTUALIZACJA --

// TEST CASE 8
// Aktualizacja wagi psa o podanym id
async function testCase8MySQL(dogId = 1308, newWeight = 20) {
  return new Promise((resolve, reject) => {
    const query = "UPDATE dogs SET weight = ? WHERE dog_id = ?";
    connection.query(query, [newWeight, dogId], (error, result) => {
      if (error) {
        console.error("Error updating dog's weight:", error);
        reject("An error occurred while updating dog's weight");
      } else {
        resolve({ message: "Dog's weight updated", dogId });
      }
    });
  });
}

router.put("/mysql/dogs/:id/weight/:weight", async (req, res, next) => {
  const dogId = req.params.id;
  const newWeight = req.params.weight;
  try {
    const data = await testCase8MySQL(dogId, newWeight);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// TEST CASE 9
// Aktualizacja daty adopcji dla konkretnego psa i właściciela
async function testCase9MySQL(ownerId = 13, dogId = 2584, newAdoptionDate = "2010-07-28") {
  return new Promise((resolve, reject) => {
    const query = "UPDATE adoptions SET adoption_date = ? WHERE owner_id = ? AND dog_id = ?";
    connection.query(query, [newAdoptionDate, ownerId, dogId], (error, result) => {
      if (error) {
        console.error("Error updating adoption date for owner and dog:", error);
        reject("An error occurred while updating adoption date for owner and dog");
      } else {
        resolve({ message: "Adoption date updated for owner and dog", ownerId, dogId });
      }
    });
  });
}

router.put("/mysql/adoptions/:ownerId/:dogId/adoption-date", async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const dogId = req.params.dogId;
  const newAdoptionDate = req.body.adoption_date;
  try {
    const data = await testCase9MySQL(ownerId, dogId, newAdoptionDate);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});


export {testCase1MySQL, testCase2MySQL, testCase3MySQL, testCase4MySQL, testCase5MySQL, testCase6MySQL, testCase7MySQL, testCase8MySQL, testCase9MySQL}