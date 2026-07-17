const mysql = require('mysql2/promise');

const demoContent = [
  {
    id: 1,
    title: 'Mérida Nights',
    category: 'Novedades',
    description: 'Una serie de suspenso con escenas de la ciudad luz de Yucatán.',
    image: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=900&q=80',
    year: 2024,
    rating: '8.9'
  },
  {
    id: 2,
    title: 'Luna en Progreso',
    category: 'Para ti',
    description: 'Una historia íntima sobre la vida moderna y los nuevos barrios.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
    year: 2023,
    rating: '8.4'
  },
  {
    id: 3,
    title: 'Río de Cobre',
    category: 'Top 10',
    description: 'El drama de una familia marcada por el tiempo y la tradición.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
    year: 2025,
    rating: '9.1'
  },
  {
    id: 4,
    title: 'Cielo de Cenotes',
    category: 'Tendencias',
    description: 'Una experiencia inmersiva inspirada en el paisaje yucateco.',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80',
    year: 2022,
    rating: '7.8'
  }
];

async function getContent() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = Number(process.env.DB_PORT || 3306);

  if (!host || !user || !password || !database) {
    return demoContent;
  }

  const connection = await mysql.createConnection({
    host,
    user,
    password,
    database,
    port,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const [rows] = await connection.execute('SELECT id, title, category, description, image, year, rating FROM contenido ORDER BY id');
    return rows;
  } finally {
    await connection.end();
  }
}

module.exports = { getContent };
