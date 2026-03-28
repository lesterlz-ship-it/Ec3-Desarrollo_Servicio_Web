const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const verifyToken = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'alejo_reportes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ========== CRUD MÉTRICAS ==========

app.get('/api/metricas', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [metricas] = await connection.query('SELECT * FROM metricas WHERE estado = ? ORDER BY nombre', ['activo']);
    connection.release();
    res.json({ success: true, data: metricas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener métricas' });
  }
});

app.post('/api/metricas', async (req, res) => {
  try {
    const { nombre, descripcion, tipo_calculo } = req.body;
    if (!nombre) return res.status(400).json({ success: false, error: 'Nombre requerido' });
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO metricas (nombre, descripcion, tipo_calculo) VALUES (?, ?, ?)',
      [nombre, descripcion || null, tipo_calculo || 'suma']
    );
    connection.release();
    res.status(201).json({ success: true, mensaje: 'Métrica creada', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al crear métrica' });
  }
});

// ========== CRUD REPORTES ==========

app.get('/api/reportes', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [reportes] = await connection.query('SELECT * FROM reportes ORDER BY fecha_generacion DESC LIMIT 100');
    connection.release();
    res.json({ success: true, data: reportes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener reportes' });
  }
});

app.get('/api/reportes/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [reporte] = await connection.query(
      'SELECT r.*, GROUP_CONCAT(JSON_OBJECT("metrica", d.metrica, "valor", d.valor) SEPARATOR ",") as datos FROM reportes r LEFT JOIN datos_reporte d ON r.id = d.reporte_id WHERE r.id = ? GROUP BY r.id',
      [req.params.id]
    );
    connection.release();
    if (reporte.length === 0) return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
    res.json({ success: true, data: reporte[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener reporte' });
  }
});

app.post('/api/reportes', async (req, res) => {
  try {
    const { titulo, descripcion, tipo_reporte, fecha_inicio, fecha_fin, usuario_generador } = req.body;
    if (!titulo) return res.status(400).json({ success: false, error: 'Título requerido' });
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO reportes (titulo, descripcion, tipo_reporte, fecha_inicio, fecha_fin, usuario_generador) VALUES (?, ?, ?, ?, ?, ?)',
      [titulo, descripcion || null, tipo_reporte || 'general', fecha_inicio || null, fecha_fin || null, usuario_generador || null]
    );
    connection.release();
    res.status(201).json({ success: true, mensaje: 'Reporte creado', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al crear reporte' });
  }
});

app.put('/api/reportes/:id', async (req, res) => {
  try {
    const { titulo, descripcion, tipo_reporte, estado } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE reportes SET titulo = ?, descripcion = ?, tipo_reporte = ?, estado = ? WHERE id = ?',
      [titulo || null, descripcion || null, tipo_reporte || null, estado || 'completado', req.params.id]
    );
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
    res.json({ success: true, mensaje: 'Reporte actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al actualizar reporte' });
  }
});

app.delete('/api/reportes/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM reportes WHERE id = ?', [req.params.id]);
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
    res.json({ success: true, mensaje: 'Reporte eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al eliminar reporte' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'ms-reportes' }));

app.listen(PORT, () => console.log(`✓ Microservicio de Reportes en puerto ${PORT}`));
