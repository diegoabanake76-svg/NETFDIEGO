const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

dotenv.config();

// Almacenamiento en memoria para usuarios registrados en Vercel
const inMemoryUsers = new Map();
inMemoryUsers.set('demo@example.com', { id: 1, email: 'demo@example.com', password: '123456', name: 'Demo User' });
inMemoryUsers.set('test@example.com', { id: 2, email: 'test@example.com', password: 'password123', name: 'Test User' });

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
    console.warn('⚠️ Credenciales de BD incompletas, usando datos demo');
    return null;
  }

  console.log(`🔌 Intentando conectar a ${host}:${port}/${database}`);

  const connectionOptions = {
    host,
    user,
    password,
    database,
    port,
    enableKeepAlive: true,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0
  };

  if (process.env.DB_SSL && process.env.DB_SSL.toLowerCase() === 'true') {
    connectionOptions.ssl = { rejectUnauthorized: false };
  }

  try {
    const conn = await mysql.createConnection(connectionOptions);
    console.log('✅ Conectado a la base de datos');
    return conn;
  } catch (error) {
    console.error('❌ Error de conexión a BD:', error.message);
    return null;
  }
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
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

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(64) NOT NULL UNIQUE,
      created_at DATETIME NOT NULL DEFAULT UTC_TIMESTAMP(),
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME NULL,
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);
}

async function createSession(connection, userId) {
  const token = generateToken();

  const [result] = await connection.execute(
    'INSERT INTO sessions (user_id, token, created_at, expires_at) VALUES (?, ?, UTC_TIMESTAMP(), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 SECOND))',
    [userId, token]
  );

  const [rows] = await connection.execute('SELECT expires_at FROM sessions WHERE id = ?', [result.insertId]);
  const expiresAt = rows[0]?.expires_at ? new Date(rows[0].expires_at).toISOString() : new Date(Date.now() + 30_000).toISOString();

  console.log(`🔐 Created session user=${userId} token=${token} expiresAt=${expiresAt}`);

  return {
    token,
    expiresAt
  };
}

async function refreshSessionToken(connection, token) {
  await connection.execute('UPDATE sessions SET expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 SECOND) WHERE token = ? AND revoked_at IS NULL', [token]);

  const [rows] = await connection.execute('SELECT expires_at FROM sessions WHERE token = ? AND revoked_at IS NULL', [token]);
  if (!rows[0]) {
    console.log(`❌ Refresh failed, token not found or revoked: ${token}`);
    return null;
  }

  const expiresAt = new Date(rows[0].expires_at).toISOString();
  console.log(`🔁 Refreshed session token=${token} newExpiresAt=${expiresAt}`);
  return { expiresAt };
}

async function revokeSession(connection, token) {
  await connection.execute('UPDATE sessions SET revoked_at = UTC_TIMESTAMP() WHERE token = ? AND revoked_at IS NULL', [token]);
  console.log(`✖️ Revoked session token=${token}`);
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

async function listSessions() {
  const connection = await getConnection();
  if (!connection) return [];

  try {
    await ensureSchema(connection);
    const [rows] = await connection.execute(`
      SELECT s.id, s.user_id, s.token, s.expires_at, s.revoked_at, u.email, u.name
      FROM sessions s
      LEFT JOIN usuarios u ON s.user_id = u.id
      ORDER BY s.id DESC
    `);
    return rows;
  } finally {
    await connection.end();
  }
}

async function authenticateUser(email, password) {
  if (inMemoryUsers.has(email)) {
    const user = inMemoryUsers.get(email);
    if (user.password === password) {
      const expiresAt = new Date(Date.now() + 30_000);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        token: generateToken(),
        expiresAt: expiresAt.toISOString()
      };
    }
    return null;
  }

  const connection = await getConnection();
  if (!connection) {
    console.warn('⚠️ BD no disponible, usuario no encontrado en memoria');
    return null;
  }

  try {
    await ensureSchema(connection);
    const [rows] = await connection.execute('SELECT id, email, name FROM usuarios WHERE email = ? AND password = ?', [email, password]);
    if (!rows[0]) {
      return null;
    }

    const user = rows[0];
    const session = await createSession(connection, user.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      token: session.token,
      expiresAt: session.expiresAt
    };
  } catch (error) {
    console.error('❌ Error en autenticación:', error.message);
    return null;
  } finally {
    await connection.end();
  }
}

async function registerUser(name, email, password) {
  if (inMemoryUsers.has(email)) {
    return { error: 'El correo ya está registrado' };
  }

  const connection = await getConnection();
  if (connection) {
    try {
      await ensureSchema(connection);
      const [existing] = await connection.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
      if (existing.length > 0) {
        return { error: 'El correo ya está registrado' };
      }

      const [result] = await connection.execute('INSERT INTO usuarios (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
      const session = await createSession(connection, result.insertId);
      return {
        id: result.insertId,
        email,
        name,
        token: session.token,
        expiresAt: session.expiresAt
      };
    } catch (error) {
      console.warn('⚠️ No se pudo guardar en BD, usando memoria:', error.message);
    } finally {
      await connection.end();
    }
  }

  const newUser = {
    id: inMemoryUsers.size + 1,
    email,
    password,
    name
  };
  inMemoryUsers.set(email, newUser);

  console.log(`✅ Usuario registrado en memoria: ${email}`);
  return { id: newUser.id, email: newUser.email, name: newUser.name };
}

async function validateSession(token) {
  const connection = await getConnection();
  if (!connection) {
    return null;
  }

  try {
    await ensureSchema(connection);
    const [rows] = await connection.execute(`
      SELECT u.id, u.email, u.name, s.token, s.expires_at
      FROM sessions s
      JOIN usuarios u ON s.user_id = u.id
      WHERE s.token = ? AND s.revoked_at IS NULL AND s.expires_at > UTC_TIMESTAMP()
    `, [token]);

    if (!rows[0]) {
      return null;
    }

    return {
      user: {
        id: rows[0].id,
        email: rows[0].email,
        name: rows[0].name
      },
      token: rows[0].token,
      expiresAt: new Date(rows[0].expires_at).toISOString()
    };
  } catch (error) {
    console.error('❌ Error al validar sesión:', error.message);
    return null;
  } finally {
    await connection.end();
  }
}

async function refreshSession(token) {
  const connection = await getConnection();
  if (!connection) {
    return null;
  }

  try {
    await ensureSchema(connection);
    const result = await refreshSessionToken(connection, token);
    return result;
  } catch (error) {
    console.error('❌ Error al refrescar sesión:', error.message);
    return null;
  } finally {
    await connection.end();
  }
}

async function logoutSession(token) {
  const connection = await getConnection();
  if (!connection) {
    return;
  }

  try {
    await ensureSchema(connection);
    await revokeSession(connection, token);
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error.message);
  } finally {
    await connection.end();
  }
}

module.exports = { getContent, authenticateUser, registerUser, validateSession, refreshSession, logoutSession };
