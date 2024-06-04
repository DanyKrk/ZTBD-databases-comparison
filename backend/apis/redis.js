import express from "express";
import redis from "redis";

export const router = express.Router();

const client = redis.createClient();

client.on("error", (err) => {
  console.error("Redis Error:", err);
});

await client.connect();

// TESTCASE 1
// Wszystkie dane z kolekcji psów.
async function testCase1Redis() {
  try {
    const dogKeys = await client.keys('dogs:*');
    const dogList = await Promise.all(dogKeys.map(async ownerKey => {
      return await client.hGetAll(ownerKey);
    }));
    return dogList;
  } catch (error) {
    throw error;
  }
}

async function getAllDogs() {
  try {
    const dogKeys = await client.keys('dogs:*');
    const dogList = await Promise.all(dogKeys.map(async ownerKey => {
      return await client.hGetAll(ownerKey);
    }));
    return dogList;
  } catch (error) {
    throw error;
  }
}

router.get("/redis/dogs", async (req, res, next) => {
  try {
    const dogList = await testCase1Redis();
    res.json(dogList);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/redis/dogs/:id", async (req, res, next) => {
  try {
    const dogId = req.params.id;
    const dogData = await client.hGetAll(`dogs:${dogId}`);
    if (Object.keys(dogData).length === 0) {
      return res.status(404).json({ error: "Owner not found" });
    }

    res.json(dogData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// TESTCASE 2
// Wszystkie dane z kolekcji ras.
async function testCase2Redis() {
  try {
    const breedKeys = await client.keys('breeds:*');
    const breedList = await Promise.all(breedKeys.map(async ownerKey => {
      return await client.hGetAll(ownerKey);
    }));
    return breedList;
  } catch (error) {
    throw error;
  }
}

router.get("/redis/breeds", async (req, res, next) => {
  try {
    const breedList = await testCase2Redis();
    res.json(breedList);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function getAllOwners() {
  try {
    const ownerKeys = await client.keys('owners:*');
    const ownerList = await Promise.all(ownerKeys.map(async ownerKey => {
      return await client.hGetAll(ownerKey);
    }));
    return ownerList;
  } catch (error) {
    throw error;
  }
}

router.get("/redis/owners", async (req, res, next) => {
  try {
    const ownerList = await getAllOwners();
    res.json(ownerList);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/redis/owners/:id", async (req, res, next) => {
  try {
    const ownerId = req.params.id;
    const ownerData = await client.hGetAll(`owners:${ownerId}`);
    if (Object.keys(ownerData).length === 0) {
      return res.status(404).json({ error: "Owner not found" });
    }

    res.json(ownerData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function getAllAdoptions() {
  try {
    const adoptionKeys = await client.keys('adoptions:*');
    const adoptionList = await Promise.all(adoptionKeys.map(async ownerKey => {
      return await client.hGetAll(ownerKey);
    }));
    return adoptionList;
  } catch (error) {
    throw error;
  }
}

async function getAllAdoptionsParsed() {
  try {
    const adoptionKeys = await client.keys('adoptions:*');
    const adoptionList = await Promise.all(adoptionKeys.map(async adoptionKey => {
      const id = adoptionKey.split(':')[1];
      const rawAdoption = await client.hGetAll(adoptionKey);
      return { adoption_id: id, ...rawAdoption };
    }));
    return adoptionList;
  } catch (error) {
    throw error;
  }
}

router.get("/redis/adoptions/:id", async (req, res, next) => {
  try {
    const adoptionId = req.params.id;
    const adoptionData = await client.hGetAll(`adoptions:${adoptionId}`);
    if (Object.keys(adoptionData).length === 0) {
      return res.status(404).json({ error: "Owner not found" });
    }

    res.json(adoptionData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// -- SELECTY Z WARUNKAMI --

// TESTCASE 3
// Pobieranie psów o określonym kolorze
async function testCase3Redis() {
  try {
    const allDogs = await getAllDogs();
    const dogsWithColor = allDogs.filter(dog => dog.color.toLowerCase() === "BROWN");
    return dogsWithColor;
  } catch (error) {
    throw error;
  }
}

router.get("/redis/dogs/color/:color", async (req, res, next) => {
  const color = req.params.color.toLowerCase();
  try {
    const allDogs = await getAllDogs();
    const dogsWithColor = allDogs.filter(dog => dog.color.toLowerCase() === color);
    res.json({ message: `Psy o kolorze ${color}`, dogs: dogsWithColor });
  } catch (error) {
    console.error(`Błąd podczas pobierania psów o kolorze ${color}:`, error);
    res.status(500).json({ error: `Wystąpił błąd podczas pobierania psów o kolorze ${color}`});
  }
});

// TESTCASE 4
// Pobieranie adopcji po określonej dacie
async function testCase4Redis() {
  try {
    const adoptions = await getAllAdoptions();
    const adoptionsAfterDate = adoptions.filter(adoption => new Date(adoption.adoption_date) > "2008-01-22");
    return adoptionsAfterDate;
  } catch (error) {
    throw error;
  }
}
router.get("/redis/adoptions/date/:date", async (req, res, next) => {
  const date = new Date(req.params.date);
  try {
    const adoptions = await getAllAdoptions();
    
    const adoptionsAfterDate = adoptions.filter(adoption => new Date(adoption.adoption_date) > date);
    
    res.json({ message: `Adopcje po ${date.toISOString()}`, adoptions: adoptionsAfterDate });
  } catch (error) {
    console.error(`Błąd podczas pobierania adopcji po ${date} z Redis:`, error);
    res.status(500).json({ error: `Wystąpił błąd podczas pobierania adopcji po ${date} z Redis` });
  }
});

// -- SELECTY Z ŁĄCZENIEM TABEL --

// TESTCASE 5
// Pobieranie imion psów i nazw ras
async function testCase5Redis() {
  try {
    // Pobranie wszystkich psów z Redis
    const allDogs = await getAllDogs();

    // Przygotowanie zapytania o nazwy ras dla każdego psa
    const breedPromises = allDogs.map(async dog => {
      // Pobranie informacji o rasie dla danego psa
      const breedInfo = await client.hGetAll(`breeds:${dog.breed_id}`);
      return breedInfo.breed_name;
    });

    // Oczekiwanie na zakończenie wszystkich zapytań
    const breedNames = await Promise.all(breedPromises);

    // Przygotowanie wyników do odpowiedzi
    const result = allDogs.map((dog, index) => ({
      dog_name: dog.dog_name,
      breed_name: breedNames[index]
    }));
    return result;
  } catch (error) {
    throw error;
  }
}
router.get("/redis/dogs-breeds", async (req, res, next) => {
  try {
    // Pobranie wszystkich psów z Redis
    const allDogs = await getAllDogs();

    // Przygotowanie zapytania o nazwy ras dla każdego psa
    const breedPromises = allDogs.map(async dog => {
      // Pobranie informacji o rasie dla danego psa
      const breedInfo = await client.hGetAll(`breeds:${dog.breed_id}`);
      return breedInfo.breed_name;
    });

    // Oczekiwanie na zakończenie wszystkich zapytań
    const breedNames = await Promise.all(breedPromises);

    // Przygotowanie wyników do odpowiedzi
    const result = allDogs.map((dog, index) => ({
      dog_name: dog.dog_name,
      breed_name: breedNames[index]
    }));

    // Zwracanie wyników w odpowiedzi JSON
    res.json({ message: "Imiona psów i nazwy ras", data: result });
  } catch (error) {
    console.error("Błąd podczas pobierania imion psów i nazw ras z Redis:", error);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania imion psów i nazw ras z Redis" });
  }
});

class Breed {
  constructor(id, breed_name, lifespan, country_of_origin) {
    this.breed_id = id;
    this.breed_name = breed_name;
    this.lifespan = lifespan;
    this.country_of_origin = country_of_origin;
  }
}

function parseBreed(id, rawBreed) {
  return new Breed(id, rawBreed.breed_name, rawBreed.lifespan, rawBreed.country_of_origin);
}

async function getAllBreedsParsed() {
  try {
    const breedKeys = await client.keys('breeds:*');
    const breedList = await Promise.all(breedKeys.map(async ownerKey => {
      const id = ownerKey.split(':')[1]; 
      const rawBreed = await client.hGetAll(ownerKey);
      return parseBreed(id, rawBreed);
    }));
    return breedList;
  } catch (error) {
    throw error;
  }
}
// TESTCASE 6
// Pobieranie psów o rasach pochodzących z ST
async function testCase6Redis() {
  try {
    const allDogs = await getAllDogs();
    
    const allBreeds = await getAllBreedsParsed();

    const usaBreedsIds = allBreeds
      .filter(breed => breed.country_of_origin === 'ST')
      .map(breed => breed.breed_id);

    const usaDogs = allDogs.filter(dog => usaBreedsIds.includes(dog.breed_id));
    return usaDogs;
  } catch (error) {
    throw error;
  }
}

router.get("/redis/dogs-usa-breeds", async (req, res, next) => {
  try {
    const allDogs = await getAllDogs();
    
    const allBreeds = await getAllBreedsParsed();

    const usaBreedsIds = allBreeds
      .filter(breed => breed.country_of_origin === 'ST')
      .map(breed => breed.breed_id);

    const usaDogs = allDogs.filter(dog => usaBreedsIds.includes(dog.breed_id));

    res.json({ message: "Psy o rasach pochodzących z ST", data: usaDogs });
  } catch (error) {
    console.error("Błąd podczas pobierania psów o rasach pochodzących z ST z Redis:", error);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania psów o rasach pochodzących z ST z Redis" });
  }
});

// -- SELECT Z GRUPOWANIEM I FUNKCJAMI AGREGUJĄCYMI --

// TEST CASE 7
// Pobieranie liczby psów dla każdej rasy, które mają więcej niż 5 osobników
async function testCase7Redis() {
  try {
    const allDogs = await getAllDogs();

    const dogsCountByBreed = allDogs.reduce((countByBreed, dog) => {
      countByBreed[dog.breed_id] = (countByBreed[dog.breed_id] || 0) + 1;
      return countByBreed;
    }, {});

    const breedsWithMoreThanFiveDogs = Object.entries(dogsCountByBreed)
      .filter(([breedId, count]) => count > 5)
      .map(([breedId, count]) => ({ breed_id: breedId, total_dogs: count }));
    return breedsWithMoreThanFiveDogs;
  } catch (error) {
    throw error;
  }
}

router.get("/redis/dogs-count-by-breed", async (req, res, next) => {
  try {
    const allDogs = await getAllDogs();

    const dogsCountByBreed = allDogs.reduce((countByBreed, dog) => {
      countByBreed[dog.breed_id] = (countByBreed[dog.breed_id] || 0) + 1;
      return countByBreed;
    }, {});

    const breedsWithMoreThanFiveDogs = Object.entries(dogsCountByBreed)
      .filter(([breedId, count]) => count > 5)
      .map(([breedId, count]) => ({ breed_id: breedId, total_dogs: count }));

    res.json({ message: "Liczba psów dla każdej rasy, która ma więcej niż 5 osobników", data: breedsWithMoreThanFiveDogs });
  } catch (error) {
    console.error("Błąd podczas pobierania liczby psów dla każdej rasy z Redis:", error);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania liczby psów dla każdej rasy z Redis" });
  }
});

// -- AKTUALIZACJA --

// TEST CASE 8
// Aktualizacja wagi psa o podanym id
async function testCase8Redis() {
  const dogId = 1308
  const newWeight = 20
  try {
    const dogExists = await client.exists(`dogs:${dogId}`);
    if (!dogExists) {
      return res.status(404).json({ error: "Pies o podanym identyfikatorze nie istnieje" });
    }

    await client.hSet(`dogs:${dogId}`, "weight", newWeight);
    return dogId;
  } catch (error) {
    throw error;
  }
}

router.put("/redis/dogs/:id/weight/:weight", async (req, res, next) => {
  const dogId = req.params.id;
  const newWeight = req.params.weight;
  try {
    const dogExists = await client.exists(`dogs:${dogId}`);
    if (!dogExists) {
      return res.status(404).json({ error: "Pies o podanym identyfikatorze nie istnieje" });
    }

    await client.hSet(`dogs:${dogId}`, "weight", newWeight);

    res.json({ message: "Zaktualizowano wagę psa", dogId });
  } catch (error) {
    console.error("Błąd podczas aktualizacji wagi psa w Redis:", error);
    res.status(500).json({ error: "Wystąpił błąd podczas aktualizacji wagi psa w Redis" });
  }
});

// TEST CASE 9
// Aktualizacja daty adopcji dla konkretnego psa i właściciela
async function testCase9Redis() {
  const ownerId = 13
  const dogId = 2584
  const newAdoptionDate = "07/28/2010"
  try {
    await updateAdoptionDateInRedis(ownerId, dogId, newAdoptionDate);
    return { message: "Zaktualizowano datę adopcji dla psa i właściciela", ownerId, dogId };
  } catch (error) {
    throw error;
  }
}

async function findAdoptionKey(ownerId, dogId) {
  try {
    const adoptions = await getAllAdoptionsParsed();
    
    for (const adoption of adoptions) {
      if (adoption.owner_id === ownerId && adoption.dog_id === dogId) {
        return `adoptions:${adoption.adoption_id}`;
      }
    }
    
    return null;
  } catch (error) {
    throw error;
  }
}

async function updateAdoptionDateInRedis(ownerId = 13, dogId = 2584, newAdoptionDate = "07/28/2010") {
  try {
      const adoptionKey = await findAdoptionKey(ownerId, dogId);
      if(adoptionKey == null){
        adoptionKey = '-1';
      }
      await client.hSet(adoptionKey, "adoption_date", newAdoptionDate);
  } catch (error) {
      throw error;
  }
}

router.put("/redis/adoptions/:ownerId/:dogId/adoption-date", async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const dogId = req.params.dogId;
  const newAdoptionDate = req.body.adoption_date;
  try {
      await updateAdoptionDateInRedis(ownerId, dogId, newAdoptionDate);
      res.json({ message: "Zaktualizowano datę adopcji dla psa i właściciela", ownerId, dogId });
  } catch (error) {
      console.error("Błąd podczas aktualizacji daty adopcji dla psa i właściciela w Redis:", error);
      res.status(500).json({ error: "Wystąpił błąd podczas aktualizacji daty adopcji dla psa i właściciela w Redis" });
  }
});

export default router;
export { testCase1Redis, testCase2Redis, testCase3Redis, testCase4Redis, testCase5Redis, testCase6Redis, testCase7Redis, testCase8Redis, testCase9Redis};
