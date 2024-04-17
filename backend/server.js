import express from "express"
import path from 'path';

export const app = express()
const PORT = 8000

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})

app.set('json spaces', 2)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const pathPublic = path.resolve(process.cwd(), 'src');
app.use(express.static(pathPublic))

app.get("/", (req, res, nest) => {
    res.json(
        {
            ProjectBy: ["Sophie Popow", "Daniel Krzykawski"],
            Serving: ["MongoDB", "PostgreSQL", "Redis", "MySQL"]
        }
    )
})

app.get("/run-tests", (req, res) => {
    // Run the test script here (or import and call a function that runs the test script)
    // Once the tests are complete, serve the HTML page with the chart
  
    // Resolve the absolute path to the test.html file
    const filePath = path.resolve(process.cwd(), 'src/index.html');
  
    // Send the file
    res.sendFile(filePath);
  });

import { router as router_mongodb } from "./apis/mongodb.js"
import { router as router_postgres } from "./apis/postgres.js"
import { router as router_redis } from "./apis/redis.js";
import { router as router_mysql } from "./apis/mysql.js"
app.use(router_mongodb)
app.use(router_postgres)
app.use(router_redis)
app.use(router_mysql)
