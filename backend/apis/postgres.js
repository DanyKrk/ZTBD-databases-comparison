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

router.get("/postgres/company", async (req, res, next) => {
  const result = await client.query("select * from indexes");
  res.json({
    message: "Result",
    result: result.rows,
  });
});

router.post("/postgres/execute", async (req, res, next) => {
  const query = req.body.query;

  let result = "Query not specified!";
  let status = 500;
  if (query) {
    try {
      // eg. query: "insert into indexes (index_name, full_name) values ('test', 'test')"
      console.log("Postgres Executing:", query);
      await client.query(query);
      status = 200;
      result = "Query Ok.";
    } catch (err) {
      result = "Query error. See console.";
      console.log(err);
    }
  }

  res.status(status).json({
    message: result,
  });
});

// TEST CASE 1
router.get("/postgres/index", async (req, res, next) => {
  const limit = Number(req.query.limit) ?? 100;
  const result = await client.query(`
        select index_data.* 
        from index_data join indexes using(index_id) 
        limit ${limit}
    `);

  result.rows.forEach((row) => {
    delete row.garbage;
  });

  res.json({
    result: result.rows,
  });
});

// TEST CASE 2
router.get("/postgres/company/:index", async (req, res, next) => {
  const index = req.params.index;
  const limit = Number(req.query.limit) ?? 100;
  const result = await client.query(`
        select index_company_data.*
        from index_company_data join indexes using(index_id) 
        where index_name = '${index}' limit ${limit}
    `);

  result.rows.forEach((row) => {
    delete row.garbage;
  });

  res.json({
    message: index + " index",
    result: result.rows,
  });
});

// TEST CASE 3
router.get("/postgres/company/:index/sorted", async (req, res, next) => {
  const index = req.params.index;
  const limit = Number(req.query.limit) ?? 100;
  const result = await client.query(`
        select index_company_data.*
        from index_company_data join indexes using(index_id) 
        where index_name = '${index}' 
        order by day desc
        limit ${limit}
    `);

  result.rows.forEach((row) => {
    delete row.garbage;
  });

  res.json({
    message: index + " index",
    result: result.rows,
  });
});

// TEST CASE 4
router.get("/postgres/company/:index/avg", async (req, res, next) => {
  const index = req.params.index;

  const result = await client.query(`
        select 
          icd.index_id,
          avg(icd.closing) as avg_closing,
          avg(icd.opening) as avg_opening,
          avg(icd.highest) as avg_highest,
          avg(icd.lowest) as avg_lowest
        from
          index_company_data icd
        join "indexes" i using(index_id) 
        where i.index_name  = '${index}'
        group by icd.index_id
    `);

  res.json({
    message: index + " index",
    result: result.rows,
  });
});

// TEST CASE 5
router.get("/postgres/company/:index/filter", async (req, res, next) => {
  const index = req.params.index;
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;

  const result = await client.query(`
        select index_company_data.*
        from index_company_data join indexes using(index_id) 
        where index_name = '${index}' and day >= '${startDate}' and day <= '${endDate}'
    `);

  result.rows.forEach((row) => {
    delete row.garbage;
  });

  res.json({
    message: index + " index",
    result: result.rows,
  });
});

// TEST CASE 6
router.post("/postgres/company/:index/update", async (req, res, next) => {
  const index = req.params.index;

  const date = req.body.date;
  const volume = Number(req.body.volume);

  const result = await client.query(`
      update index_company_data set volume = ${volume} 
      where index_id = (select index_id from indexes where index_name = '${index}') and day = '${date}'
    `);

  result.rows.forEach((row) => {
    delete row.garbage;
  });

  res.json({
    message: index + " index",
    result: result.rows,
  });
});

// TEST CASE 7
router.delete("/postgres/company/:index", async (req, res, next) => {
  const index = req.params.index;

  const date = req.query.date;

  const result = await client.query(`
      delete from index_company_data 
      where index_id = (select index_id from indexes where index_name = '${index}') and day = '${date}'
    `);

  result.rows.forEach((row) => {
    delete row.garbage;
  });

  res.json({
    message: index + " index",
    result: result.rows,
  });
});

// TEST CASE 8
router.post("/postgres/company/:index/insert", async (req, res, next) => {
  const index = req.params.index;

  const day = req.body.day;
  const volume = req.body.volume;
  const open = req.body.open;
  const close = req.body.close;
  const high = req.body.high;
  const low = req.body.low;

  const result = await client.query(`
      insert into index_company_data (index_id, day, volume, opening, closing, highest, lowest) 
      values ((select index_id from indexes where index_name = '${index}'), '${day}', ${volume}, ${open}, ${close}, ${high}, ${low})
    `);

  res.json({
    message: index + " index",
    result: result.rows,
  });
});
