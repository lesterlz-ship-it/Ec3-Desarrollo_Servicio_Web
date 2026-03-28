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
  database: process.env.DB_NAME || 'alejo_resolucion',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/api/resolucion', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM resolucion');
    connection.release();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/resolucion/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM resolucion WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'No encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/resolucion', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ success: false, error: 'Data requerida' });
    const connection = await pool.getConnection();
    const [result] = await connection.execute('INSERT INTO resolucion (data, fecha_creacion) VALUES (?, NOW())', [data]);
    connection.release();
    res.status(201).json({ success: true, message: 'Creado', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/resolucion/:id', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ success: false, error: 'Data requerida' });
    const connection = await pool.getConnection();
    await connection.execute('UPDATE resolucion SET data = ?, fecha_actualizacion = NOW() WHERE id = ?', [data, req.params.id]);
    connection.release();
    res.json({ success: true, message: 'Actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/resolucion/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM resolucion WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ success: true, message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'ms-resolucion' }));

const PORT = process.env.PORT || 3033;
app.listen(PORT, () => console.log(`✓ ms-resolucion en puerto \${PORT}`));
