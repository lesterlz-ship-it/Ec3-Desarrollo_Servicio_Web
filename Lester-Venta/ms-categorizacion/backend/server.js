const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const verifyToken = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'alejo_categorizacion',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const validarCategoria = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
  body('descripcion').optional(),
  body('nivel_prioridad').optional().isInt(),
  body('tiempo_respuesta_dias').optional().isInt()
];

// ========== CRUD CATEGORÍAS ==========

app.get('/api/categorias', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [categorias] = await connection.query('SELECT * FROM categorias ORDER BY nombre');
    connection.release();
    res.json({ success: true, data: categorias });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener categorías' });
  }
});

app.get('/api/categorias/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [categoria] = await connection.query('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
    connection.release();
    if (categoria.length === 0) return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
    res.json({ success: true, data: categoria[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener categoría' });
  }
});

app.post('/api/categorias', validarCategoria, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { nombre, descripcion, nivel_prioridad, tiempo_respuesta_dias, estado } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO categorias (nombre, descripcion, nivel_prioridad, tiempo_respuesta_dias, estado) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion || null, nivel_prioridad || 1, tiempo_respuesta_dias || null, estado || 'activo']
    );
    connection.release();
    res.status(201).json({ success: true, mensaje: 'Categoría creada', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al crear categoría' });
  }
});

app.put('/api/categorias/:id', validarCategoria, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { nombre, descripcion, nivel_prioridad, tiempo_respuesta_dias, estado } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE categorias SET nombre = ?, descripcion = ?, nivel_prioridad = ?, tiempo_respuesta_dias = ?, estado = ? WHERE id = ?',
      [nombre, descripcion || null, nivel_prioridad || 1, tiempo_respuesta_dias || null, estado || 'activo', req.params.id]
    );
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
    res.json({ success: true, mensaje: 'Categoría actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al actualizar categoría' });
  }
});

app.delete('/api/categorias/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM categorias WHERE id = ?', [req.params.id]);
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
    res.json({ success: true, mensaje: 'Categoría eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al eliminar categoría' });
  }
});

// ========== CRUD SUBCATEGORÍAS ==========

app.get('/api/subcategorias', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [subcategorias] = await connection.query(
      'SELECT s.*, c.nombre as categoria_nombre FROM subcategorias s JOIN categorias c ON s.categoria_id = c.id'
    );
    connection.release();
    res.json({ success: true, data: subcategorias });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener subcategorías' });
  }
});

app.get('/api/subcategorias/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [subcategoria] = await connection.query('SELECT * FROM subcategorias WHERE id = ?', [req.params.id]);
    connection.release();
    if (subcategoria.length === 0) return res.status(404).json({ success: false, error: 'Subcategoría no encontrada' });
    res.json({ success: true, data: subcategoria[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener subcategoría' });
  }
});

app.post('/api/subcategorias', async (req, res) => {
  try {
    const { categoria_id, nombre, descripcion, estado } = req.body;
    if (!categoria_id || !nombre) return res.status(400).json({ success: false, error: 'Campos requeridos' });
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO subcategorias (categoria_id, nombre, descripcion, estado) VALUES (?, ?, ?, ?)',
      [categoria_id, nombre, descripcion || null, estado || 'activo']
    );
    connection.release();
    res.status(201).json({ success: true, mensaje: 'Subcategoría creada', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al crear subcategoría' });
  }
});

app.put('/api/subcategorias/:id', async (req, res) => {
  try {
    const { categoria_id, nombre, descripcion, estado } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE subcategorias SET categoria_id = ?, nombre = ?, descripcion = ?, estado = ? WHERE id = ?',
      [categoria_id, nombre, descripcion || null, estado || 'activo', req.params.id]
    );
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Subcategoría no encontrada' });
    res.json({ success: true, mensaje: 'Subcategoría actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al actualizar subcategoría' });
  }
});

app.delete('/api/subcategorias/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM subcategorias WHERE id = ?', [req.params.id]);
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Subcategoría no encontrada' });
    res.json({ success: true, mensaje: 'Subcategoría eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al eliminar subcategoría' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'ms-categorizacion' }));

app.listen(PORT, () => console.log(`✓ Microservicio de Categorización en puerto ${PORT}`));
