const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const sourceConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306)
};

const targetConfig = {
  host: 'sql10.freesqldatabase.com',
  user: 'sql10834798',
  password: 'zBw1Gr227k',
  database: 'sql10834798',
  port: 3306
};

function getConnectionOptions(config) {
  return {
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port,
    enableKeepAlive: true,
    connectTimeout: 20000,
    timezone: 'Z'
  };
}

async function connect(config) {
  const connection = await mysql.createConnection(getConnectionOptions(config));
  return connection;
}

async function getTableNames(connection) {
  const [rows] = await connection.query('SHOW TABLES');
  const key = Object.keys(rows[0] || {})[0];
  return rows.map((row) => row[key]);
}

async function migrate() {
  const source = await connect(sourceConfig);
  const target = await connect(targetConfig);

  try {
    const tables = await getTableNames(source);
    console.log(`Tablas encontradas en la BD origen: ${tables.join(', ')}`);

    for (const table of tables) {
      const [createRows] = await source.query(`SHOW CREATE TABLE \`${table}\``);
      const createStatement = createRows[0]['Create Table'];
      const normalizedCreate = createStatement.replace(/AUTO_INCREMENT=[0-9]+/gi, '');

      await target.query(`DROP TABLE IF EXISTS \`${table}\``);
      await target.query(normalizedCreate);

      const [rows] = await source.query(`SELECT * FROM \`${table}\``);
      if (!rows.length) {
        console.log(`Tabla ${table}: sin filas para copiar`);
        continue;
      }

      const columns = Object.keys(rows[0]);
      const quotedColumns = columns.map((col) => `\`${col}\``).join(', ');
      const placeholders = columns.map(() => '?').join(', ');
      const values = rows.map((row) => columns.map((col) => row[col]));
      const insertSql = `INSERT INTO \`${table}\` (${quotedColumns}) VALUES (${values.map(() => placeholders).join('), (')})`;
      await target.query(insertSql, values.flat());

      console.log(`Tabla ${table}: ${rows.length} filas migradas`);
    }

    console.log('✅ Migración completada');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exitCode = 1;
  } finally {
    await source.end();
    await target.end();
  }
}

migrate();
