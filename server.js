const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3002;

// Connect to SQLite database FIRST
const db = new sqlite3.Database('./smilecare.db', (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
  }
});

// Create appointments table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    dob TEXT,
    gender TEXT,
    appointmentTime TEXT,
    treatment TEXT
  )
`);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API ROUTES - These must come BEFORE static file serving

app.post('/submit-appointment', (req, res) => {
  const { firstName, lastName, dob, gender, appointmentTime, treatment } = req.body;

  if (!firstName || !appointmentTime || !treatment) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO appointments (firstName, lastName, dob, gender, appointmentTime, treatment)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [firstName, lastName, dob, gender, appointmentTime, treatment], function (err) {
    if (err) {
      console.error('❌ Insert error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }

    console.log(`✅ New appointment saved (ID: ${this.lastID})`);
    res.json({ success: true, id: this.lastID });
  });
});

app.get('/bookings', (req, res) => {
  const query = 'SELECT * FROM appointments ORDER BY appointmentTime DESC';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('❌ Fetch error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }

    const formatted = rows.map(r => ({
      id: r.id,
      name: `${r.firstName} ${r.lastName}`,
      dateOfBirth: r.dob,
      gender: r.gender,
      dateTime: r.appointmentTime,
      treatment: r.treatment
    }));

    res.json(formatted);
  });
});

// SPECIFIC PAGE ROUTES - These must come BEFORE static file serving
app.get('/', (req, res) => {
  console.log('Root route accessed - serving Home.html');
  res.sendFile(path.join(__dirname, 'Home.html'));
});

app.get('/login', (req, res) => {
  console.log('Login route accessed');
  res.sendFile(path.join(__dirname, 'Login.html'));
});

// Login authentication endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { username, password });
  
  // Simple authentication - you can modify this logic
  if (username && password) {
    // For now, accept any username/password combination
    // In a real app, you'd check against a database
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(400).json({ success: false, message: 'Username and password are required' });
  }
});

app.get('/Staff-1.html', (req, res) => {
  console.log('Staff dashboard accessed');
  res.sendFile(path.join(__dirname, 'Staff-1.html'));
});

// STATIC FILE SERVING - This must come LAST
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
  console.log('  GET /Staff-1.html - Staff dashboard');
});
