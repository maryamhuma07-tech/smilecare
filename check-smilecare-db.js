const sqlite3 = require('sqlite3').verbose();

// Connect to smilecare.db database
const db = new sqlite3.Database('./smilecare.db', (err) => {
  if (err) {
    console.error('❌ Error connecting to smilecare.db:', err.message);
  } else {
    console.log('✅ Connected to smilecare.db database.');
    
    // Check what tables exist
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
      if (err) {
        console.error('❌ Error checking tables:', err.message);
      } else {
        console.log('📋 Tables in smilecare.db:');
        tables.forEach(table => {
          console.log(`  - ${table.name}`);
        });
        
        // Check appointments table
        db.all('SELECT * FROM appointments', [], (err, rows) => {
          if (err) {
            console.error('❌ Error fetching appointments:', err.message);
          } else {
            console.log(`\n📊 Found ${rows.length} appointments in smilecare.db:`);
            if (rows.length === 0) {
              console.log('No appointments found. Database is empty.');
            } else {
              rows.forEach((row, index) => {
                console.log(`\nAppointment ${index + 1}:`);
                console.log(`  ID: ${row.id}`);
                console.log(`  Name: ${row.firstName} ${row.lastName}`);
                console.log(`  DOB: ${row.dob}`);
                console.log(`  Gender: ${row.gender}`);
                console.log(`  Appointment Time: ${row.appointmentTime}`);
                console.log(`  Treatment: ${row.treatment}`);
              });
            }
          }
          
          // Close database connection
          db.close();
        });
      }
    });
  }
}); 