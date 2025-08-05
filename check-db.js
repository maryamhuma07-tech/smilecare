const sqlite3 = require('sqlite3').verbose();

// Connect to database
const db = new sqlite3.Database('./smilecare.db', (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
    
    // Check existing appointments
    db.all('SELECT * FROM appointments', [], (err, rows) => {
      if (err) {
        console.error('❌ Error fetching appointments:', err.message);
      } else {
        console.log('📋 Current appointments in database:');
        if (rows.length === 0) {
          console.log('No appointments found. Database is empty.');
        } else {
          rows.forEach((row, index) => {
            console.log(`Appointment ${index + 1}:`);
            console.log(`  ID: ${row.id}`);
            console.log(`  Name: ${row.firstName} ${row.lastName}`);
            console.log(`  DOB: ${row.dob}`);
            console.log(`  Gender: ${row.gender}`);
            console.log(`  Appointment Time: ${row.appointmentTime}`);
            console.log(`  Treatment: ${row.treatment}`);
            console.log('---');
          });
        }
      }
      
      // Close database connection
      db.close();
    });
  }
}); 