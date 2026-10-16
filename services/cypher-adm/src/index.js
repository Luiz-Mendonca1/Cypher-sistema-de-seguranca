const express = require('express');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Servir arquivos estáticos para a interface Web do Dashboard (futura pasta public)
app.use(express.static('src/public'));

// -----------------------------------------------------------------------------
// 1. POST /api/telemetry
// Recebe dados do CYPHERAgent, cadastra/atualiza a máquina e retorna o status
// -----------------------------------------------------------------------------
app.post('/api/telemetry', (req, res) => {
  const { mac, hostname, ip } = req.body;

  if (!mac) {
    return res.status(400).json({ error: 'Endereço MAC é obrigatório.' });
  }

  const query = `
    INSERT INTO devices (mac, hostname, ip, status, last_seen)
    VALUES (?, ?, ?, 'NORMAL', CURRENT_TIMESTAMP)
    ON CONFLICT(mac) DO UPDATE SET
      hostname = excluded.hostname,
      ip = excluded.ip,
      last_seen = CURRENT_TIMESTAMP;
  `;

  db.run(query, [mac, hostname, ip], function (err) {
    if (err) {
      console.error('[ERRO TELEMETRIA]', err.message);
      return res.status(500).json({ error: 'Erro ao registrar telemetria.' });
    }

    // Busca o status atualizado do dispositivo (para avisar o agente se ele está em Quarentena)
    db.get('SELECT status FROM devices WHERE mac = ?', [mac], (err, row) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar status.' });
      
      console.log(`[TELEMETRIA] Dispositivo ${mac} (${hostname}) atualizado. Status: ${row.status}`);
      return res.json({ success: true, status: row.status });
    });
  });
});

// -----------------------------------------------------------------------------
// 2. POST /api/alerts
// Recebe alerta emergencial (ex: Honeyfile violado) e altera status para QUARENTENA
// -----------------------------------------------------------------------------
app.post('/api/alerts', (req, res) => {
  const { mac, severity, description } = req.body;

  if (!mac || !description) {
    return res.status(400).json({ error: 'MAC e descrição são obrigatórios.' });
  }

  const insertAlertQuery = `
    INSERT INTO alerts (mac, severity, description)
    VALUES (?, ?, ?)
  `;

  const updateDeviceQuery = `
    UPDATE devices 
    SET status = 'QUARENTENA', last_seen = CURRENT_TIMESTAMP 
    WHERE mac = ?
  `;

  // Registra o Alerta
  db.run(insertAlertQuery, [mac, severity || 'HIGH', description], function (err) {
    if (err) {
      console.error('[ERRO ALERTA]', err.message);
      return res.status(500).json({ error: 'Erro ao registrar alerta.' });
    }

    // Coloca a máquina em Quarentena no banco
    db.run(updateDeviceQuery, [mac], function (err) {
      if (err) {
        console.error('[ERRO QUARENTENA]', err.message);
        return res.status(500).json({ error: 'Erro ao alterar status para Quarentena.' });
      }

      console.warn(`[ALERTA CRÍTICO] Dispositivo ${mac} colocado em QUARENTENA! Motivo: ${description}`);
      return res.json({ success: true, status: 'QUARENTENA', alertId: this.lastID });
    });
  });
});

// -----------------------------------------------------------------------------
// 3. POST /api/quarantine/release
// Permite ao administrador remover a máquina do isolamento
// -----------------------------------------------------------------------------
app.post('/api/quarantine/release', (req, res) => {
  const { mac, adminKey } = req.body;

  // Validação simples de chave de administrador para o MVP
  if (adminKey !== 'admin123') {
    return res.status(401).json({ error: 'Chave de autorização inválida.' });
  }

  if (!mac) {
    return res.status(400).json({ error: 'Endereço MAC é obrigatório.' });
  }

  const query = `
    UPDATE devices 
    SET status = 'NORMAL', last_seen = CURRENT_TIMESTAMP 
    WHERE mac = ?
  `;

  db.run(query, [mac], function (err) {
    if (err) {
      console.error('[ERRO LIBERAÇÃO]', err.message);
      return res.status(500).json({ error: 'Erro ao liberar dispositivo.' });
    }

    console.log(`[LIBERAÇÃO] Dispositivo ${mac} retornado ao status NORMAL pelo administrador.`);
    return res.json({ success: true, status: 'NORMAL' });
  });
});

// -----------------------------------------------------------------------------
// 4. GET /api/devices e GET /api/alerts (Para o Dashboard Web)
// -----------------------------------------------------------------------------
app.get('/api/devices', (req, res) => {
  db.all('SELECT * FROM devices ORDER BY last_seen DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/alerts', (req, res) => {
  db.all('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 50', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// -----------------------------------------------------------------------------
// Inicialização do Servidor
// -----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` CYPHERADM Backend rodando na porta ${PORT}`);
  console.log(` Endpoints prontos:`);
  console.log(` - POST /api/telemetry`);
  console.log(` - POST /api/alerts`);
  console.log(` - POST /api/quarantine/release`);
  console.log(` - GET  /api/devices`);
  console.log(` - GET  /api/alerts`);
  console.log(`=================================================`);
});