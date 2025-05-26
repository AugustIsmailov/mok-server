const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const doctors = JSON.parse(fs.readFileSync('doctors.json', 'utf8'));

app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

app.get('/api/doctors/:id', (req, res) => {
  const doctor = doctors.find(d => d.id === req.params.id);
  if (doctor) {
    res.json(doctor);
  } else {
    res.status(404).json({ error: 'Doctor not found' });
  }
});

app.get('/api/doctors/:id/schedule', (req, res) => {
  const doctor = doctors.find(d => d.id === req.params.id);
  if (doctor) {
    res.json({ id: doctor.id, name: doctor.name, schedule: doctor.schedule });
  } else {
    res.status(404).json({ error: 'Doctor not found' });
  }
});

app.get('/api/doctors/:id/dates', (req, res) => {
  const doctor = doctors.find(d => d.id === req.params.id);
  if (doctor) {
    const dates = doctor.schedule.map(s => s.date);
    res.json({ id: doctor.id, name: doctor.name, dates: dates });
  } else {
    res.status(404).json({ error: 'Doctor not found' });
  }
});

// Обновленная функция с учётом новой структуры времени
function formatSchedule(doctor) {
  let result = `${doctor.name} принимает:\n`;
  doctor.schedule.forEach(day => {
    // Берём только поле time из каждого объекта времени
    const times = day.time.map(t => t.time).join(', ');
    result += `${day.date} — ${times}\n`;
  });
  return result;
}

app.get('/api/doctors/:id/schedule-text', (req, res) => {
  const doctor = doctors.find(d => d.id === req.params.id);
  if (doctor) {
    const text = formatSchedule(doctor);
    res.type('text/plain').send(text);
  } else {
    res.status(404).json({ error: 'Doctor not found' });
  }
});

app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});
