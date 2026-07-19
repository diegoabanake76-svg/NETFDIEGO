const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

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
  },
  {
    id: 5,
    title: 'Ciudad de Bronce',
    category: 'Novedades',
    description: 'Una trama urbana con secretos, poder y romance en una ciudad luminosa.',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
    year: 2024,
    rating: '8.2'
  },
  {
    id: 6,
    title: 'Sol de Cenote',
    category: 'Para ti',
    description: 'Un drama fresco sobre el pasado, el mar y los recuerdos que regresan.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    year: 2023,
    rating: '7.9'
  },
  {
    id: 7,
    title: 'Vespera del Sur',
    category: 'Top 10',
    description: 'Una historia tensa y elegante sobre noches, sombras y decisiones.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    year: 2025,
    rating: '8.7'
  },
  {
    id: 8,
    title: 'Horizonte Azul',
    category: 'Tendencias',
    description: 'Un viaje visual por playas, cielos y un amor imposible.',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    year: 2021,
    rating: '8.1'
  },
  {
    id: 9,
    title: 'Sombras de Henequén',
    category: 'Novedades',
    description: 'Una historia de misterio y herencia familiar en un entorno muy visual.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
    year: 2026,
    rating: '8.5'
  },
  {
    id: 10,
    title: 'La Última Bahía',
    category: 'Para ti',
    description: 'Una experiencia emotiva que mezcla nostalgia, mar y una última oportunidad.',
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80',
    year: 2022,
    rating: '8.3'
  }
];

async function getConnection() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = Number(process.env.DB_PORT || 3306);

  if (!host || !user || !password || !database) {
    return null;
  }

  const connectionOptions = {
    host,
    user,
    password,
    database,
    port
  };

  if (process.env.DB_SSL && process.env.DB_SSL.toLowerCase() === 'true') {
    connectionOptions.ssl = { rejectUnauthorized: false };
  }

  return mysql.createConnection(connectionOptions);
}

async function ensureSchema(connection) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS contenido (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT,
      image VARCHAR(500),
      year INT,
      rating VARCHAR(10)
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    )
  `);
}

async function seedContentIfEmpty(connection) {
  const [rows] = await connection.execute('SELECT COUNT(*) AS total FROM contenido');
  const currentCount = Number(rows[0].total || 0);

  if (currentCount < 10) {
    const itemsToInsert = demoContent.slice(0, 10 - currentCount);
    if (itemsToInsert.length > 0) {
      const insertSql = 'INSERT INTO contenido (title, category, description, image, year, rating) VALUES ?';
      const values = itemsToInsert.map(item => [item.title, item.category, item.description, item.image, item.year, item.rating]);
      await connection.query(insertSql, [values]);
    }
  }
}

async function getContent() {
  const connection = await getConnection();

  if (!connection) {
    return demoContent;
  }

  try {
    await ensureSchema(connection);
    await seedContentIfEmpty(connection);
    const [rows] = await connection.execute('SELECT id, title, category, description, image, year, rating FROM contenido ORDER BY id');
    return rows;
  } finally {
    await connection.end();
  }
}

async function authenticateUser(email, password) {
  const connection = await getConnection();

  if (!connection) {
    return null;
  }

  try {
    await ensureSchema(connection);
    const [rows] = await connection.execute('SELECT id, email, name FROM usuarios WHERE email = ? AND password = ?', [email, password]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function registerUser(name, email, password) {
  const connection = await getConnection();

  if (!connection) {
    return null;
  }

  try {
    await ensureSchema(connection);
    const [existing] = await connection.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return { error: 'El correo ya está registrado' };
    }

    await connection.execute('INSERT INTO usuarios (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
    const [rows] = await connection.execute('SELECT id, email, name FROM usuarios WHERE email = ? AND password = ?', [email, password]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

module.exports = { getContent, authenticateUser, registerUser };
