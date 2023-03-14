const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./main.db");

const createTableQuery = `
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`;

db.run(createTableQuery, (error) => {
  if (error) {
    console.error(error.message);
    return;
  }
  console.log("Table created successfully");
});

db.close();
