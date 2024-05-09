const express = require('express');
const mysql = require('mysql');
const app = express();
const PORT = process.env.PORT || 3000;

// Create a MySQL database connection
const db = mysql.createConnection({
  host: 'localhost', // Your MySQL host
  user: 'root', // Your MySQL username
  password: '', // Your MySQL password
  database: 'todos' // Your MySQL database name
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Create table if not exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT
  )
`;

db.query(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating todos table:', err);
  } else {
    console.log('todos table created or already exists');
  }
});

app.use(express.json());

// Define a handler for the root URL ("/") and serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Get all TODOs
app.get('/todos', (req, res) => {
  const query = 'SELECT * FROM todos';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching TODOs:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

// Add a new TODO
app.post('/todos', (req, res) => {
  const { title, description } = req.body;
  const insertQuery = 'INSERT INTO todos (title, description) VALUES (?, ?)';
  db.query(insertQuery, [title, description], (err, result) => {
    if (err) {
      console.error('Error adding TODO:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(201).json({ message: 'TODO added', id: result.insertId });
    }
  });
});

app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;
  const deleteQuery = 'DELETE FROM todos WHERE id = ?';
  db.query(deleteQuery, id, (err, result) => {
    if (err) {
      console.error('Error deleting TODO:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (result.affectedRows === 0) {
      console.error('TODO not found:', id);
      res.status(404).json({ error: 'TODO not found' });
    } else {
      console.log('TODO deleted:', id);
      res.sendStatus(204); // No content response
    }
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));