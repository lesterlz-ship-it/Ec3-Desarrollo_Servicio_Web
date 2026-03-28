const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const verifyToken = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configuración de conexión MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'alejo_clientes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware de validación
const validarCliente = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
  body('apellido').trim().notEmpty().withMessage('Apellido requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('telefono').optional().trim(),
  body('documento_identidad').optional().trim()
];

// ========== CRUD CLIENTES ==========

// GET - Obtener todos los clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [clientes] = await connection.query('SELECT * FROM clientes ORDER BY fecha_creacion DESC');
    connection.release();
    res.json({ success: true, data: clientes, count: clientes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener clientes' });
  }
});

// GET - Obtener cliente por ID
app.get('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [cliente] = await connection.query('SELECT * FROM clientes WHERE id = ?', [id]);
    connection.release();
    
    if (cliente.length === 0) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    }
    res.json({ success: true, data: cliente[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener cliente' });
  }
});

// POST - Crear nuevo cliente
app.post('/api/clientes', validarCliente, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { nombre, apellido, email, telefono, documento_identidad, direccion, ciudad, estado } = req.body;
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'INSERT INTO clientes (nombre, apellido, email, telefono, documento_identidad, direccion, ciudad, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, email, telefono || null, documento_identidad || null, direccion || null, ciudad || null, estado || 'activo']
    );
    
    connection.release();
    res.status(201).json({ success: true, mensaje: 'Cliente creado exitosamente', id: result.insertId });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: 'Email o documento ya existe' });
    }
    res.status(500).json({ success: false, error: 'Error al crear cliente' });
  }
});

// PUT - Actualizar cliente
app.put('/api/clientes/:id', validarCliente, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, documento_identidad, direccion, ciudad, estado } = req.body;
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'UPDATE clientes SET nombre = ?, apellido = ?, email = ?, telefono = ?, documento_identidad = ?, direccion = ?, ciudad = ?, estado = ? WHERE id = ?',
      [nombre, apellido, email, telefono || null, documento_identidad || null, direccion || null, ciudad || null, estado || 'activo', id]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    }
    res.json({ success: true, mensaje: 'Cliente actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: 'Email o documento ya existe' });
    }
    res.status(500).json({ success: false, error: 'Error al actualizar cliente' });
  }
});

// DELETE - Eliminar cliente
app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM clientes WHERE id = ?', [id]);
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    }
    res.json({ success: true, mensaje: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al eliminar cliente' });
  }
});

// GET - Obtener clientes activos
app.get('/api/clientes/estado/activo', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [clientes] = await connection.query('SELECT * FROM clientes WHERE estado = ? ORDER BY fecha_creacion DESC', ['activo']);
    connection.release();
    res.json({ success: true, data: clientes, count: clientes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener clientes' });
  }
});

// Health Check
app.get('/health', (req, res) => res.json({ status: 'OK', service: 'ms-clientes' }));

app.listen(PORT, () => {
  console.log(`✓ Microservicio de Clientes ejecutándose en puerto ${PORT}`);
});
