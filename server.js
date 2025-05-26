const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;


app.use(cors()); // чтобы JAICP мог обращаться
app.use(express.json());

// Загрузка базы врачей из файла
const doctors = JSON.parse(fs.readFileSync('doctors.json', 'utf8'));

// Получить всех врачей
app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

// Получить врача по ID
app.get('/api/doctors/:id', (req, res) => {
  const doctor = doctors.find(d => d.id === req.params.id);
  if (doctor) {
    res.json(doctor);
  } else {
    res.status(404).json({ error: 'Doctor not found' });
  }
});

// Старт сервера
app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});
