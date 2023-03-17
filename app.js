const sqlite3 = require("sqlite3").verbose();
const express = require("express");

const db = new sqlite3.Database("./main.db");
const app = express();

app.use(express.json());

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const credentials = authHeader.split(" ")[1];
  const decoded = Buffer.from(credentials, "base64").toString("ascii");
  const [username, password] = decoded.split(":");

  db.get(
    `SELECT id FROM users WHERE email = ? AND password = ?`,
    [username, password],
    (error, user) => {
      if (error) {
        res.status(500).send("Server error");
        return;
      }
      if (!user) {
        res.status(401).send("Invalid credentials");
        return;
      }
      console.log("user found");
      req.userId = user.id;
      next();
    }
  );
};

app.post("/register", (req, res) => {
  console.log("request", req.body);

  const { name, email, password } = req.body;

  db.run(
    `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
    [name, email, password],
    (error, data) => {
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

app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", (error, users) => {
    if (error) {
      console.error(error.message);
      res.status(500).json("Server error");
      return;
    }
    res.json(users);
  });
});

app.post("/posts", authenticate, (req, res) => {
  console.log("request", req.body);
  const { content } = req.body;

  db.run(
    `INSERT INTO post (content, user_id) VALUES (?, ?)`,
    [content, req.userId],
    (error, data) => {
      if (error) {
        console.error(error.message);
        res.status(500).send("Server error");
        return;
      }
      console.log(`Post added to database`);
      res.send(`Post added to database`);
    }
  );
});

app.get("/post/:postId", (req, res) => {
  const { postId } = req.params;

  db.get(
    `SELECT post.*, users.name AS author FROM post 
     JOIN users ON post.user_id = users.id 
     WHERE post.id = ?`,
    [postId],
    (error, post) => {
      if (error) {
        console.error(error.message);
        res.status(500).send("Server error");
        return;
      }
      if (!post) {
        res.status(404).send("Post not found");
        return;
      }
      res.json(post);
    }
  );
});

app.put("/post/:postId", authenticate, (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  db.run(
    `UPDATE post SET content = ? WHERE id = ? AND user_id = ?`,
    [content, postId, user.id],

    (error, data) => {
      if (error) {
        console.error(error.message);
        res.status(500).send("Server error");
        return;
      }
      console.log(`Post ${postId} updated in database`);
      res.send(`Post ${postId} updated in database`);
    }
  );
});

app.delete("/post/:postId", authenticate, (req, res) => {
  const { postId } = req.params;

  db.get(`SELECT user_id FROM post WHERE id = ?`, [postId], (error, post) => {
    if (error) {
      console.error(error.message);
      res.status(500).send("Server error");
      return;
    }
    if (!post || post.user_id !== user.id) {
      res.status(403).send("Unauthorized");
      return;
    }
    db.run(
      `DELETE FROM post WHERE id = ? AND user_id = ?`,
      [postId, user.id],
      (error, data) => {
        if (error) {
          console.error(error.message);
          res.status(500).send("Server error");
          return;
        }
        console.log("data", data);
        console.log(`Post ${postId} deleted from database`);
        res.send(`Post ${postId} deleted from database`);
      }
    );
  });
});

app.listen(3000);
