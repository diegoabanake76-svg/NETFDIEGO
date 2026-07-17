const fs = require('fs');
const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'sql10.freesqldatabase.com',
      user: 'sql10833294',
      password: 'IabILjyj7l',
      database: 'sql10833294',
      port: 3306,
      ssl: { rejectUnauthorized: false }
    });

    const [rows] = await conn.execute('SELECT COUNT(*) AS total FROM contenido');
    const [items] = await conn.execute('SELECT id, title, category FROM contenido ORDER BY id');
    await conn.end();

    const result = { total: rows[0].total, items };
    fs.writeFileSync('db-check.json', JSON.stringify(result, null, 2));
    console.log('DB_OK');
  } catch (error) {
    fs.writeFileSync('db-check.json', JSON.stringify({ error: error.message }, null, 2));
    console.error(error.message);
    process.exit(1);
  }
})();
