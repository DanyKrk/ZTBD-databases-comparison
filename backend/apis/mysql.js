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
