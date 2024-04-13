import express from "express"

export const app = express()
const PORT = 8000

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})

app.set('json spaces', 2)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get("/", (req, res, nest) => {
    res.json(
        {
            ProjectBy: ["Sophie Popow", "Daniel Krzykawski"],
            Serving: ["MongoDB", "PostgreSQL", "Redis", "MySQL"]
        }
    )
})

import { router as router_mongodb } from "./apis/mongodb.js"
import { router as router_postgres } from "./apis/postgres.js"
// import { router as router_mysql } from "./apis/mysql.js"
app.use(router_mongodb)
app.use(router_postgres)
// app.use(router_mysql)
