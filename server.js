const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3002;

// Connect to SQLite database
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
    appointmentTime TEXT UNIQUE,
    treatment TEXT
  )
`);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Submit new appointment (with 30-minute gap check)
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
    SELECT * FROM appointments
    WHERE appointmentTime BETWEEN ? AND ?
  `;

  db.all(conflictQuery, [bufferStart, bufferEnd], (err, rows) => {
    if (err) {
      console.error('❌ Conflict check error:', err.message);
      return res.status(500).json({ success: false, message: 'Database error during time check' });
    }

    if (rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is not available. Appointments must be at least 30 minutes apart.'
      });
    }

    // Insert appointment
    const insertSql = `
      INSERT INTO appointments (firstName, lastName, dob, gender, appointmentTime, treatment)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(insertSql, [firstName, lastName, dob, gender, appointmentTime, treatment], function (err) {
      if (err) {
        console.error('❌ Insert error:', err.message);
        return res.status(500).json({ success: false, message: err.message });
      }

      console.log(`✅ New appointment saved (ID: ${this.lastID})`);
      res.json({ success: true, id: this.lastID });
    });
  });
});

// ✅ Get all bookings (sorted by oldest, formatted ID)
app.get('/bookings', (req, res) => {
  const query = 'SELECT * FROM appointments ORDER BY id ASC';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('❌ Fetch error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }

    const formatted = rows.map((r, i) => ({
      id: String(i + 1).padStart(2, '0'),  // ID format: 01, 02...
      name: `${r.firstName} ${r.lastName}`,
      dateOfBirth: r.dob,
      gender: r.gender,
      dateTime: r.appointmentTime,
      treatment: r.treatment
    }));

    res.json(formatted);
  });
});

// ✅ Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Home.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'Login.html'));
});

app.get('/Staff.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Staff.html'));
});

// ✅ Basic login handler (mock auth)
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

// ✅ Start the server
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

