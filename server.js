const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { getContent } = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/content', async (req, res) => {
  try {
    const content = await getContent();
    res.json(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar los contenidos' });
  }
});

app.get('/inmobiliaria', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
