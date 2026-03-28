const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const verifyToken = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'alejo_evaluacion',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ========== CRUD CRITERIOS ==========

app.get('/api/criterios', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [criterios] = await connection.query('SELECT * FROM criterios_evaluacion WHERE estado = ? ORDER BY nombre', ['activo']);
    connection.release();
    res.json({ success: true, data: criterios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener criterios' });
  }
});

app.post('/api/criterios', async (req, res) => {
  try {
    const { nombre, descripcion, peso, escala_minima, escala_maxima } = req.body;
    if (!nombre) return res.status(400).json({ success: false, error: 'Nombre requerido' });
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO criterios_evaluacion (nombre, descripcion, peso, escala_minima, escala_maxima) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion || null, peso || 1, escala_minima || 1, escala_maxima || 5]
    );
    connection.release();
    res.status(201).json({ success: true, mensaje: 'Criterio creado', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al crear criterio' });
  }
});

// ========== CRUD EVALUACIONES ==========

app.get('/api/evaluaciones', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [evaluaciones] = await connection.query('SELECT * FROM evaluaciones ORDER BY fecha_evaluacion DESC');
    connection.release();
    res.json({ success: true, data: evaluaciones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener evaluaciones' });
  }
});

app.get('/api/evaluaciones/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [evaluacion] = await connection.query('SELECT * FROM evaluaciones WHERE id = ?', [req.params.id]);
    connection.release();
    if (evaluacion.length === 0) return res.status(404).json({ success: false, error: 'Evaluación no encontrada' });
    res.json({ success: true, data: evaluacion[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener evaluación' });
  }
});

app.post('/api/evaluaciones', async (req, res) => {
  try {
    const { reclamo_id, asignacion_id, calidad_atencion, tiempo_respuesta, resolucion_efectiva, comentarios, evaluador_id } = req.body;
    if (!reclamo_id) return res.status(400).json({ success: false, error: 'reclamo_id requerido' });
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO evaluaciones (reclamo_id, asignacion_id, calidad_atencion, tiempo_respuesta, resolucion_efectiva, comentarios, evaluador_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [reclamo_id, asignacion_id || null, calidad_atencion || 0, tiempo_respuesta || 0, resolucion_efectiva || 0, comentarios || null, evaluador_id || null]
    );
    connection.release();
    res.status(201).json({ success: true, mensaje: 'Evaluación creada', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al crear evaluación' });
  }
});

app.put('/api/evaluaciones/:id', async (req, res) => {
  try {
    const { calidad_atencion, tiempo_respuesta, resolucion_efectiva, comentarios } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE evaluaciones SET calidad_atencion = ?, tiempo_respuesta = ?, resolucion_efectiva = ?, comentarios = ? WHERE id = ?',
      [calidad_atencion || 0, tiempo_respuesta || 0, resolucion_efectiva || 0, comentarios || null, req.params.id]
    );
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Evaluación no encontrada' });
    res.json({ success: true, mensaje: 'Evaluación actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al actualizar evaluación' });
  }
});

app.delete('/api/evaluaciones/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM evaluaciones WHERE id = ?', [req.params.id]);
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Evaluación no encontrada' });
    res.json({ success: true, mensaje: 'Evaluación eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al eliminar evaluación' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'ms-evaluacion' }));

app.listen(PORT, () => console.log(`✓ Microservicio de Evaluación en puerto ${PORT}`));
