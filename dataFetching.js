const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3001;

// Create a MySQL connection
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "#1234567",
  database: "energy"
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// API endpoint to fetch data from MySQL and send as JSON
app.get('/data', (req, res) => {
  const query = 'SELECT * FROM sensordata';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error querying database:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    console.log('Query results:', results); // Log query results for debugging
    res.json(results);
  });
});

// Function to fetch data and store every 10 seconds
function fetchData() {
  try {
    console.log("Fetching and storing sensor data...");
    // Your data fetching and storing logic goes here
  } catch (error) {
    console.error("Error fetching and storing sensor data:", error);
  }
}

// Start fetching and storing sensor data
setInterval(fetchData, 10000); // Run every 10 seconds (10000 milliseconds)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
