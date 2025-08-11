const express = require('express');
const { Client } = require('pg');  // PostgreSQL client for Node.js
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3002;

// Set up PostgreSQL connection using environment variable DATABASE_URL
const client = new Client({
  connectionString: process.env.database_url,  
  ssl: { rejectUnauthorized: false } 
});

// Connect to PostgreSQL database
client.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database.'))
  .catch(err => {
    console.error('❌ Error connecting to PostgreSQL:', err.message);
  });

// Create appointments table if it doesn't exist
const createTableSql = `
  CREATE TABLE IF NOT EXISTS smilecare (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dob DATE NOT NULL,
    gender TEXT NOT NULL,
    appointment_time TIMESTAMP WITH TIME ZONE NOT NULL UNIQUE,
    treatment TEXT NOT NULL
  );
`;

client.query(createTableSql)
  .then(() => console.log('✅ Appointments table created or already exists.'))
  .catch(err => {
    console.error('❌ Error creating table:', err.message);
  });

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Submit new appointment (with 30-minute gap check)
app.post('/submit-appointment', (req, res) => {
  const { firstName, lastName, dob, gender, appointmentTime, treatment } = req.body;

  if (!firstName || !appointmentTime || !treatment) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Check for appointments within ±30 minutes of selected time
  const selectedTime = new Date(appointmentTime);
  const bufferStart = new Date(selectedTime.getTime() - 30 * 60000).toISOString();
  const bufferEnd = new Date(selectedTime.getTime() + 30 * 60000).toISOString();

  const conflictQuery = `
    SELECT * FROM smilecare
    WHERE appointment_time BETWEEN $1 AND $2
  `;

  client.query(conflictQuery, [bufferStart, bufferEnd])
    .then(result => {
      if (result.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'This time slot is not available. Appointments must be at least 30 minutes apart.'
        });
      }

      // Insert appointment
      const insertSql = `
        INSERT INTO smilecare (first_name, last_name, dob, gender, appointment_time, treatment)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `;

      client.query(insertSql, [firstName, lastName, dob, gender, appointmentTime, treatment])
        .then(result => {
          console.log(`✅ New appointment saved (ID: ${result.rows[0].id})`);
          res.json({ success: true, id: result.rows[0].id });
        })
        .catch(err => {
          console.error('❌ Insert error:', err.message);
          res.status(500).json({ success: false, message: err.message });
        });
    })
    .catch(err => {
      console.error('❌ Conflict check error:', err.message);
      res.status(500).json({ success: false, message: 'Database error during time check' });
    });
});

// Get all bookings (sorted by oldest, formatted ID)
app.get('/bookings', (req, res) => {
  const query = 'SELECT * FROM smilecare ORDER BY id ASC';

  client.query(query)
    .then(result => {
      const formatted = result.rows.map((r, i) => ({
        id: String(i + 1).padStart(2, '0'),  // ID format: 01, 02...
        name: `${r.first_name} ${r.last_name}`,
        dateOfBirth: r.dob,
        gender: r.gender,
        dateTime: r.appointment_time,
        treatment: r.treatment
      }));

      res.json(formatted);
    })
    .catch(err => {
      console.error('❌ Fetch error:', err.message);
      res.status(500).json({ success: false, message: err.message });
    });
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Home.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'Login.html'));
});

app.get('/Staff.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Staff.html'));
});

// Basic login handler (mock auth)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(400).json({ success: false, message: 'Username and password are required' });
  }
});

// Static file support (HTML, CSS, JS)
app.use(express.static(__dirname));

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log('📋 Available routes:');
  console.log('  POST /submit-appointment - Submit appointment');
  console.log('  POST /login - Login authentication');
  console.log('  GET /bookings - Get all bookings');
  console.log('  GET / - Root page (Home.html)');
  console.log('  GET /login - Login page');
  console.log('  GET /Staff.html - Staff dashboard');
});
