const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());

const { Client } = require("pg");

const client = new Client({
  host: "localhost",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "password",
});

client
  .connect()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.log(error);
  });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// get
app.get("/students", (req, res) => {
  client.query("SELECT * FROM students", (error, result) => {
    if (error) {
      res.status(500).json({
        error: error.message,
      });
    } else {
      res.json(result.rows);
    }
  });
});
// post
app.post("/students", (req, res) => {
  const { first_name, last_name, email } = req.body;
  const query = `INSERT INTO students (first_name, last_name, email) VALUES ($1, $2, $3) RETURNING *`;
  client.query(query, [first_name, last_name, email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(results.rows[0]);
  });
});

// put
app.put("/students/:id", (req, res) => {
  const { first_name, last_name, email } = req.body;

  client.query(
    "UPDATE students SET first_name=$1, last_name=$2, email=$3 WHERE id=$4",
    [first_name, last_name, email, req.params.id],
    (error, result) => {
      if (error) {
        res.status(500).json({
          error: error.message,
        });
      } else {
        res.json({
          message: "Student updated successfully",
          student: {
            id: req.params.id,
            first_name,
            last_name,
            email,
          },
        });
      }
    }
  );
});

// delete
app.delete("/students/:id", (req, res) => {
  const id = req.params.id;
  client.query(`DELETE FROM students WHERE id = $1`, [id], (error, result) => {
    if (error) {
      res.status(500).json({ error });
    } else {
      res.status(200).json(`Student with ID: ${id} was deleted.`);
    }
  });
});

// close the database connection when finished
process.on("SIGINT", () => {
  client.end(() => {
    console.log("PostgreSQL connection closed");
    process.exit();
  });
});
