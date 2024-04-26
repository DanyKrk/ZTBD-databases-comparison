import express from "express";
import redis from "redis";

export const router = express.Router();

// Connect to Redis
// const url = "redis://172.21.0.5:6379";
// const client = redis.createClient({
//     url: url
//   });
const client = redis.createClient();

// Redis client error handling
client.on("error", (err) => {
  console.error("Redis Error:", err);
});

await client.connect();

// Define routes
router.get("/redis", (req, res, next) => {
  // Get information about the Redis server
  client.info((err, info) => {
    if (err) {
      console.error("Redis Error:", err);
      return res.status(500).json({ message: "Error fetching Redis info" });
    }
    res.json({ message: "Redis Info", info });
  });
});

router.get("/redis/breeds", (req, res, next) => {
  // Get all breeds from Redis
  client.keys("breeds:*", (err, keys) => {
    if (err) {
      console.error("Redis Error:", err);
      return res.status(500).json({ message: "Error fetching breeds" });
    }

    // Get details of each breed
    const breeds = [];
    if (keys.length > 0) {
      keys.forEach((key) => {
        client.hgetall(key, (err, breed) => {
          if (err) {
            console.error("Redis Error:", err);
            return res.status(500).json({ message: "Error fetching breed details" });
          }
          breeds.push(breed);
          if (breeds.length === keys.length) {
            res.json({ message: "Breeds", breeds });
          }
        });
      });
    } else {
      res.json({ message: "No breeds found" });
    }
  });
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

    // Retrieve owner data from Redis
    const ownerData = await client.hGetAll(`owners:${ownerId}`);

    // Check if owner data exists
    if (Object.keys(ownerData).length === 0) {
      return res.status(404).json({ error: "Owner not found" });
    }

    // Send the owner data as a JSON response
    res.json(ownerData);
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

  router.get("/redis/test", async (req, res, next) => {
    try {
      // Set user session data
      await client.hSet('user-session:123', {
        name: 'John',
        surname: 'Smith',
        company: 'Redis',
        age: 29
      });
  
      // Retrieve user session data
      let userSession = await client.hGetAll('user-session:123');
      console.log(JSON.stringify(userSession, null, 2));
  
      // Send the user session data as a JSON response
      res.json(userSession);
    } catch (error) {
      // Handle errors
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  
// Add more routes for other Redis operations as needed

export default router;
