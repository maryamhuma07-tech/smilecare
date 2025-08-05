const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // This will serve your HTML, CSS, etc.

const appointments = []; // Replace with a real DB later

app.post('/submit-appointment', (req, res) => {
  const { appointmentTime } = req.body;

  // Check for duplicate
  const isTaken = appointments.some(app => app.appointmentTime === appointmentTime);
  if (isTaken) {
    return res.status(409).json({
      success: false,
      message: 'Appointment time is already taken.'
    });
  }

  // Save new appointment
  appointments.push(req.body);
  return res.json({
    success: true,
    message: 'Appointment booked successfully.'
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
