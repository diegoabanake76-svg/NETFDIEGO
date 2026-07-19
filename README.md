# STREAMVERSE v1.0

Plataforma de streaming inspirada en Netflix con autenticación, base de datos MySQL y catálogo dinámico de películas y series.

## Características

- 🎬 Interfaz estilo Netflix con hero banner y filas de contenido
- 👤 Autenticación de usuarios (login y registro)
- 🗄️ Base de datos MySQL para usuarios y contenido
- 🔍 Buscador de películas y series
- 📱 Diseño responsive
- 🎭 Modal de detalles y pantalla de reproducción
- 🎨 Animaciones suaves y interfaz moderna

## Estructura del Proyecto

- `server.js`: Servidor Express con rutas de API
- `db.js`: Conexión y manejo de base de datos MySQL
- `public/index.html`: Interfaz principal
- `public/app.js`: Lógica del frontend
- `public/styles.css`: Estilos de la aplicación
- `.env`: Variables de entorno (conexión a BD)

## Cómo usar

1. Instala las dependencias:

```bash
npm install
```

2. Configura tu `.env` con los datos de conexión MySQL

3. Inicia el servidor:

```bash
node server.js
```

4. Abre `http://localhost:3000` en tu navegador

## Cuenta de prueba

- Email: `demo@example.com`
- Contraseña: `123456`

## Tecnologías

- Node.js + Express
- MySQL 8.0+
- HTML5, CSS3, Vanilla JavaScript
- Dotenv para variables de entorno
