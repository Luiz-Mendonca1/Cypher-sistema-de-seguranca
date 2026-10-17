const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Permite chamadas do Dashboard Next.js
app.use(express.json());

// -----------------------------------------------------------------------------
// 1. POST /api/telemetry
// Recebe dados do CYPHERAgent (incluindo métricas do psutil)
// -----------------------------------------------------------------------------
app.post('/api/telemetry', (req, res) => {
  const { mac, hostname, ip, cpu_usage, ram_usage, process_count } = req.body;

  if (!mac) {
    return res.status(400).json({ error: 'Endereço MAC é obrigatório.' });
  }

  // Se já existe, atualiza telemetria SEM sobrescrever o status de QUARENTENA
  const query = `
    INSERT INTO devices (mac, hostname, ip, cpu_usage, ram_usage, process_count, status, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, 'NORMAL', CURRENT_TIMESTAMP)
    ON CONFLICT(mac) DO UPDATE SET
      hostname = excluded.hostname,
      ip = excluded.ip,
      cpu_usage = excluded.cpu_usage,
      ram_usage = excluded.ram_usage,
      process_count = excluded.process_count,
      last_seen = CURRENT_TIMESTAMP;
  `;

  db.run(
    query,
    [mac, hostname || 'Desconhecido', ip || '0.0.0.0', cpu_usage || 0, ram_usage || 0, process_count || 0],
    function (err) {
      if (err) {
        console.error('[ERRO TELEMETRIA]', err.message);
        return res.status(500).json({ error: 'Erro ao registrar telemetria.' });
      }

      db.get('SELECT status FROM devices WHERE mac = ?', [mac], (err, row) => {
        if (err || !row) return res.status(500).json({ error: 'Erro ao buscar status.' });
        return res.json({ success: true, status: row.status });
      });
    }
  );
});

// -----------------------------------------------------------------------------
// 2. POST /api/alerts
// Registra o incidente e garante isolamento imediato 
// -----------------------------------------------------------------------------
app.post('/api/alerts', (req, res) => {
  const { mac, severity, description, hostname, ip } = req.body;

  if (!mac || !description) {
    return res.status(400).json({ error: 'MAC e descrição são obrigatórios.' });
  }

  const insertAlertQuery = `
    INSERT INTO alerts (mac, severity, description)
    VALUES (?, ?, ?)
  `;

  // Upsert: garante que o dispositivo é criado como QUARENTENA caso ainda não existisse
  const upsertDeviceQuery = `
    INSERT INTO devices (mac, hostname, ip, status, last_seen)
    VALUES (?, ?, ?, 'QUARENTENA', CURRENT_TIMESTAMP)
    ON CONFLICT(mac) DO UPDATE SET 
      status = 'QUARENTENA', 
      last_seen = CURRENT_TIMESTAMP;
  `;

  db.run(insertAlertQuery, [mac, severity || 'CRITICAL', description], function (err) {
    if (err) {
      console.error('[ERRO ALERTA]', err.message);
      return res.status(500).json({ error: 'Erro ao registrar alerta.' });
    }

    db.run(upsertDeviceQuery, [mac, hostname || 'Host Desconhecido', ip || '0.0.0.0'], function (err) {
      if (err) {
        console.error('[ERRO QUARENTENA]', err.message);
        return res.status(500).json({ error: 'Erro ao alterar status para Quarentena.' });
      }

      console.warn(`\x1b[31m[ALERTA CRÍTICO] Dispositivo ${mac} colocado em QUARENTENA! Motivo: ${description}\x1b[0m`);
      return res.json({ success: true, status: 'QUARENTENA' });
    });
  });
});

// -----------------------------------------------------------------------------
// 3. POST /api/quarantine/release
// Libera o host com chave administrativa e justificativa 
// -----------------------------------------------------------------------------
app.post('/api/quarantine/release', (req, res) => {
  const { mac, adminKey, justification } = req.body;

  if (adminKey !== 'admin123') {
    return res.status(401).json({ error: 'Chave de autorização inválida.' });
  }

  if (!mac) {
    return res.status(400).json({ error: 'Endereço MAC é obrigatório.' });
  }

  const updateDeviceQuery = `
    UPDATE devices 
    SET status = 'NORMAL', last_seen = CURRENT_TIMESTAMP 
    WHERE mac = ?
  `;

  const logReleaseQuery = `
    INSERT INTO release_logs (mac, justification)
    VALUES (?, ?)
  `;

  db.run(updateDeviceQuery, [mac], function (err) {
    if (err) {
      console.error('[ERRO LIBERAÇÃO]', err.message);
      return res.status(500).json({ error: 'Erro ao liberar dispositivo.' });
    }

    db.run(logReleaseQuery, [mac, justification || 'Liberação manual realizada pelo administrador'], () => {});

    console.log(`\x1b[32m[LIBERAÇÃO] Dispositivo ${mac} retornado ao status NORMAL. Justificativa: ${justification || 'N/A'}\x1b[0m`);
    return res.json({ success: true, status: 'NORMAL' });
  });
});

// -----------------------------------------------------------------------------
// 4. GET /api/devices e GET /api/alerts
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
// Inicialização
// -----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` CYPHERADM Backend rodando na porta ${PORT}`);
  console.log(` Endpoints prontos para Agent & Dashboard`);
  console.log(`=================================================`);
});