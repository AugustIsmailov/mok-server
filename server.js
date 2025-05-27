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

function formatSchedule(doctor) {
  let result = `${doctor.name} принимает:\n`;
  doctor.schedule.forEach(day => {
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

// 🔐 Новый маршрут: блокировка слота
// ...
app.patch('/api/doctors/:id/schedule/lock', (req, res) => {
  const rawId = req.params.id;
  const doctorId = decodeURIComponent(rawId);

  console.log('Raw ID from URL:', rawId);
  console.log('Decoded doctorId:', doctorId);
  console.log('All doctor IDs:', doctors.map(d => d.id));

  const { date, time } = req.body;

  if (!date || !time) {
    return res.status(400).json({ error: 'Missing date or time in request body' });
  }

  const doctor = doctors.find(d => d.id === doctorId);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  const day = doctor.schedule.find(s => s.date === date);
  if (!day) {
    return res.status(404).json({ error: 'Date not found in schedule' });
  }

  const index = day.time.findIndex(t => t.time === time);
  if (index === -1) {
    return res.status(404).json({ error: 'Time slot not found or already taken' });
  }

  day.time.splice(index, 1); // Удаляем слот — считаем, что он занят

  // Сохраняем обратно в файл
  fs.writeFileSync('doctors.json', JSON.stringify(doctors, null, 2));

  return res.status(200).json({ message: 'Time slot locked' });
});


app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});
