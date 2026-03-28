const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const verifyToken = require('./middlewares/authMiddleware');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'alejo_seguimiento_reclamos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/api/seguimiento', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM seguimiento');
    connection.release();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/seguimiento/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM seguimiento WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'No encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/seguimiento', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ success: false, error: 'Data requerida' });
    const connection = await pool.getConnection();
    const [result] = await connection.execute('INSERT INTO seguimiento (data, fecha_creacion) VALUES (?, NOW())', [data]);
    connection.release();
    res.status(201).json({ success: true, message: 'Creado', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/seguimiento/:id', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ success: false, error: 'Data requerida' });
    const connection = await pool.getConnection();
    await connection.execute('UPDATE seguimiento SET data = ?, fecha_actualizacion = NOW() WHERE id = ?', [data, req.params.id]);
    connection.release();
    res.json({ success: true, message: 'Actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/seguimiento/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM seguimiento WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ success: true, message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'ms-seguimiento-reclamos' }));

const PORT = process.env.PORT || 3034;
app.listen(PORT, () => console.log(`✓ ms-seguimiento-reclamos en puerto \${PORT}`));
