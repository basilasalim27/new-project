const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./main.db");
const express = require("express");
const app = express();
app.use(express.json());

db.run(`CREATE TABLE IF NOT EXISTS post (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT,
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`);

app.post("/register", function (req, res) {
  console.log("request", req.body);

  const { name, email, password } = req.body;

  db.run(
    `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
    [name, email, password],
    function (error) {
      if (error) {
        console.error(error.message);
        res.status(500).send("Server error");
        return;
      }
      console.log(`User ${name} added to database`);
      res.send(`User ${name} added to database`);
    }
  );
});

app.get("/users", function (req, res) {
  db.all("SELECT * FROM users", function (error, users) {
    if (error) {
      console.error(error.message);
      res.status(500).json("Server error");
      return;
    }
    res.json(users);
  });
});

app.post("/posts", function (req, res) {
  console.log("request", req.body);
  const { content } = req.body;
  const authHeader = req.headers.authorization;
  const credentials = authHeader.split(" ")[1];
  const decoded = Buffer.from(credentials, "base64").toString("ascii");
  const [username, password] = decoded.split(":");

  console.log("username:", username);
  console.log("password:", password);

  db.get(
    `SELECT id FROM users WHERE email = ? AND password = ?`,
    [username, password],
    function (error, user) {
      if (error) {
        console.error(error.message);
        res.status(500).send("Server error");
        return;
      }
      if (!user) {
        res.status(401).send("Invalid credentials");
        return;
      }

      console.log("user_id:", user.id);

      db.run(
        `INSERT INTO post (content, user_id) VALUES (?, ?)`,
        [content, user.id],
        function (error) {
          if (error) {
            console.error(error.message);
            res.status(500).send("Server error");
            return;
          }
          console.log(`Post added to database`);
          res.send(`Post added to database`);
        }
      );
    }
  );
});

app.listen(3000);
