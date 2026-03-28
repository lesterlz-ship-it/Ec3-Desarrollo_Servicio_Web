const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const verifyToken = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'alejo_seguimiento',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ========== CRUD RECLAMOS ==========

app.get('/api/reclamos', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [reclamos] = await connection.query('SELECT * FROM reclamos ORDER BY fecha_creacion DESC LIMIT 100');
    connection.release();
    res.json({ success: true, data: reclamos, count: reclamos.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener reclamos' });
  }
});

app.get('/api/reclamos/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [reclamo] = await connection.query('SELECT * FROM reclamos WHERE id = ?', [req.params.id]);
    connection.release();
    if (reclamo.length === 0) return res.status(404).json({ success: false, error: 'Reclamo no encontrado' });
    res.json({ success: true, data: reclamo[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener reclamo' });
  }
});

app.post('/api/reclamos', async (req, res) => {
  try {
    const { cliente_id, numero_reclamo, descripcion, categoria_id, prioridad, monto_reclamado } = req.body;
    if (!cliente_id || !descripcion) return res.status(400).json({ success: false, error: 'Campos requeridos' });
    
    const connection = await pool.getConnection();
    const numeroReclamo = numero_reclamo || `REC-${Date.now()}`;
    
    const [result] = await connection.query(
      'INSERT INTO reclamos (cliente_id, numero_reclamo, descripcion, categoria_id, prioridad, monto_reclamado, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [cliente_id, numeroReclamo, descripcion, categoria_id || null, prioridad || 'media', monto_reclamado || 0, 'abierto']
    );
    connection.release();
    res.status(201).json({ success: true, mensaje: 'Reclamo creado', id: result.insertId, numero_reclamo: numeroReclamo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al crear reclamo' });
  }
});

app.put('/api/reclamos/:id', async (req, res) => {
  try {
    const { descripcion, categoria_id, prioridad, monto_reclamado, estado, monto_compensacion } = req.body;
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'UPDATE reclamos SET descripcion = ?, categoria_id = ?, prioridad = ?, monto_reclamado = ?, estado = ?, monto_compensacion = ? WHERE id = ?',
      [descripcion || null, categoria_id || null, prioridad || 'media', monto_reclamado || 0, estado || 'abierto', monto_compensacion || null, req.params.id]
    );
    connection.release();
    
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Reclamo no encontrado' });
    res.json({ success: true, mensaje: 'Reclamo actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al actualizar reclamo' });
  }
});

app.delete('/api/reclamos/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM reclamos WHERE id = ?', [req.params.id]);
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Reclamo no encontrado' });
    res.json({ success: true, mensaje: 'Reclamo eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al eliminar reclamo' });
  }
});

// ========== CRUD SEGUIMIENTO ==========

app.get('/api/seguimiento/:reclamo_id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [seguimientos] = await connection.query('SELECT * FROM seguimiento_reclamos WHERE reclamo_id = ? ORDER BY fecha_actualizacion DESC', [req.params.reclamo_id]);
    connection.release();
    res.json({ success: true, data: seguimientos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener seguimiento' });
  }
});

app.post('/api/seguimiento', async (req, res) => {
  try {
    const { reclamo_id, estado_anterior, estado_nuevo, comentario, usuario_actualizacion } = req.body;
    if (!reclamo_id || !estado_nuevo) return res.status(400).json({ success: false, error: 'Campos requeridos' });
    
    const connection = await pool.getConnection();
    
    // Registrar seguimiento
    const [result1] = await connection.query(
      'INSERT INTO seguimiento_reclamos (reclamo_id, estado_anterior, estado_nuevo, comentario, usuario_actualizacion) VALUES (?, ?, ?, ?, ?)',
      [reclamo_id, estado_anterior || null, estado_nuevo, comentario || null, usuario_actualizacion || null]
    );
    
    // Registrar en historial
    await connection.query(
      'INSERT INTO historial_estado (reclamo_id, estado, razon) VALUES (?, ?, ?)',
      [reclamo_id, estado_nuevo, comentario || '']
    );
    
    connection.release();
    res.status(201).json({ success: true, mensaje: 'Seguimiento registrado', id: result1.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al registrar seguimiento' });
  }
});

// ========== CRUD HISTORIAL ==========

app.get('/api/historial/:reclamo_id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [historial] = await connection.query('SELECT * FROM historial_estado WHERE reclamo_id = ? ORDER BY fecha_cambio DESC', [req.params.reclamo_id]);
    connection.release();
    res.json({ success: true, data: historial });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener historial' });
  }
});

// ========== FILTROS Y BÚSQUEDAS ==========

app.get('/api/reclamos/estado/:estado', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [reclamos] = await connection.query('SELECT * FROM reclamos WHERE estado = ? ORDER BY fecha_creacion DESC', [req.params.estado]);
    connection.release();
    res.json({ success: true, data: reclamos, count: reclamos.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error en búsqueda' });
  }
});

app.get('/api/reclamos/cliente/:cliente_id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [reclamos] = await connection.query('SELECT * FROM reclamos WHERE cliente_id = ? ORDER BY fecha_creacion DESC', [req.params.cliente_id]);
    connection.release();
    res.json({ success: true, data: reclamos, count: reclamos.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error en búsqueda' });
  }
});

app.get('/api/estadisticas', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_reclamos,
        SUM(CASE WHEN estado = 'abierto' THEN 1 ELSE 0 END) as abiertos,
        SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes
      FROM reclamos
    `);
    connection.release();
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'ms-seguimiento' }));

app.listen(PORT, () => console.log(`✓ Microservicio de Seguimiento en puerto ${PORT}`));
