const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const verifyToken = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Configurar upload de archivos
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'alejo_evidencia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ========== CRUD TIPOS DE EVIDENCIA ==========

app.get('/api/tipos-evidencia', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [tipos] = await connection.query('SELECT * FROM tipos_evidencia WHERE estado = ? ORDER BY nombre', ['activo']);
    connection.release();
    res.json({ success: true, data: tipos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener tipos de evidencia' });
  }
});

app.post('/api/tipos-evidencia', async (req, res) => {
  try {
    const { nombre, descripcion, permitidos_formatos, tamaño_maximo_mb } = req.body;
    if (!nombre) return res.status(400).json({ success: false, error: 'Nombre requerido' });
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO tipos_evidencia (nombre, descripcion, permitidos_formatos, tamaño_maximo_mb) VALUES (?, ?, ?, ?)',
      [nombre, descripcion || null, permitidos_formatos || null, tamaño_maximo_mb || 10]
    );
    connection.release();
    res.status(201).json({ success: true, mensaje: 'Tipo de evidencia creado', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al crear tipo de evidencia' });
  }
});

// ========== CRUD EVIDENCIAS ==========

app.get('/api/evidencias', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [evidencias] = await connection.query('SELECT * FROM evidencias ORDER BY fecha_carga DESC');
    connection.release();
    res.json({ success: true, data: evidencias });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener evidencias' });
  }
});

app.get('/api/evidencias/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [evidencia] = await connection.query('SELECT * FROM evidencias WHERE id = ?', [req.params.id]);
    connection.release();
    if (evidencia.length === 0) return res.status(404).json({ success: false, error: 'Evidencia no encontrada' });
    res.json({ success: true, data: evidencia[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener evidencia' });
  }
});

app.post('/api/evidencias', upload.single('archivo'), async (req, res) => {
  try {
    const { reclamo_id, tipo_evidencia, descripcion, usuario_carga } = req.body;
    if (!reclamo_id) return res.status(400).json({ success: false, error: 'reclamo_id requerido' });
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO evidencias (reclamo_id, tipo_evidencia, descripcion, archivo_nombre, archivo_ruta, archivo_tamaño, archivo_tipo, usuario_carga) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [reclamo_id, tipo_evidencia || null, descripcion || null, req.file?.filename || null, req.file?.path || null, req.file?.size || 0, req.file?.mimetype || null, usuario_carga || null]
    );
    connection.release();
    res.status(201).json({ success: true, mensaje: 'Evidencia cargada', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al cargar evidencia' });
  }
});

app.put('/api/evidencias/:id', async (req, res) => {
  try {
    const { estado, verificado_por } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE evidencias SET estado = ?, verificado_por = ?, fecha_verificacion = NOW() WHERE id = ?',
      [estado || 'registrada', verificado_por || null, req.params.id]
    );
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Evidencia no encontrada' });
    res.json({ success: true, mensaje: 'Evidencia actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al actualizar evidencia' });
  }
});

app.delete('/api/evidencias/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM evidencias WHERE id = ?', [req.params.id]);
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Evidencia no encontrada' });
    res.json({ success: true, mensaje: 'Evidencia eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al eliminar evidencia' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'ms-evidencia' }));

app.listen(PORT, () => console.log(`✓ Microservicio de Evidencia en puerto ${PORT}`));
