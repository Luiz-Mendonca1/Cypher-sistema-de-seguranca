const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../cypher.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Tabela de Dispositivos (com telemetria de hardware)
  db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      mac TEXT PRIMARY KEY,
      hostname TEXT,
      ip TEXT,
      cpu_usage REAL DEFAULT 0,
      ram_usage REAL DEFAULT 0,
      process_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'NORMAL',
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de Alertas
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

  // Tabela de Auditoria de Liberação 
  db.run(`
    CREATE TABLE IF NOT EXISTS release_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mac TEXT,
      justification TEXT,
      released_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

console.log('[DATABASE] Banco de dados SQLite inicializado.');

module.exports = db;