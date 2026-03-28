const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();
const verifyToken = require('./middlewares/authMiddleware');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Rutas CRUD
app.get('/api/ms-inventario', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM `ms-inventario`');
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ms-inventario/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM `ms-inventario` WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ms-inventario', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { name, description, status } = req.body;
    const [result] = await connection.query(
      'INSERT INTO `ms-inventario` (name, description, status) VALUES (?, ?, ?)',
      [name, description, status || 'active']
    );
    connection.release();
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/ms-inventario/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { name, description, status } = req.body;
    await connection.query(
      'UPDATE `ms-inventario` SET name = ?, description = ?, status = ? WHERE id = ?',
      [name, description, status, req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/ms-inventario/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM `ms-inventario` WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'lester-inventario' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ms-inventario ejecutándose en puerto ${PORT}`);
});