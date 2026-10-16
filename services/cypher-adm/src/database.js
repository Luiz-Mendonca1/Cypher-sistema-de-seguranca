const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../cypher.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Tabela de Dispositivos (Devices)
  db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      mac TEXT PRIMARY KEY,
      hostname TEXT,
      ip TEXT,
      status TEXT DEFAULT 'NORMAL',
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de Alertas (Alerts)
  db.run(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mac TEXT,
      severity TEXT,
      description TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mac) REFERENCES devices(mac)
    )
  `);
});

console.log('[DATABASE] Banco de dados SQLite inicializado.');

module.exports = db;