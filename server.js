const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { getContent, authenticateUser, registerUser, validateSession, refreshSession, logoutSession, listSessions } = require('./db');

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

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error al iniciar sesión' });
  }
});

app.get('/api/session', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
    if (!token) {
      return res.status(401).json({ error: 'Sesión no encontrada' });
    }

    const session = await validateSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Sesión expirada' });
    }

    res.json({ success: true, session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo validar la sesión' });
  }
});

app.post('/api/session/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body?.token;
    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    const refreshed = await refreshSession(token);
    if (!refreshed) {
      return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    res.json({ success: true, refreshed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo refrescar la sesión' });
  }
});

app.post('/api/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body?.token;
    if (token) {
      await logoutSession(token);
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo cerrar la sesión' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    const result = await registerUser(name, email, password);
    if (!result || result.error) {
      return res.status(409).json({ error: result?.error || 'No se pudo crear el usuario' });
    }

    res.json({ success: true, user: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error al crear el usuario' });
  }
});

// Debug: listar sesiones (protegido por DEBUG_SECRET)
app.get('/api/debug/sessions', async (req, res) => {
  try {
    const secret = req.query.secret;
    if (!process.env.DEBUG_SECRET || secret !== process.env.DEBUG_SECRET) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const sessions = await listSessions();
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('❌ Error debug sessions:', error.message);
    res.status(500).json({ error: 'No se pudieron listar las sesiones' });
  }
});

app.get('/inmobiliaria', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Ruta de API no encontrada' });
  }

  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
