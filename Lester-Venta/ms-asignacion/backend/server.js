const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const verifyToken = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'alejo_asignacion',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ========== CRUD EMPLEADOS ==========

app.get('/api/empleados', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [empleados] = await connection.query('SELECT * FROM empleados WHERE estado = ? ORDER BY nombre', ['activo']);
    connection.release();
    res.json({ success: true, data: empleados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener empleados' });
  }
});

app.post('/api/empleados', async (req, res) => {
  try {
    const { nombre, apellido, email, cargo, departamento, estado } = req.body;
    if (!nombre || !apellido) return res.status(400).json({ success: false, error: 'Campos requeridos' });
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO empleados (nombre, apellido, email, cargo, departamento, estado, fecha_contratacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, email || null, cargo || null, departamento || null, estado || 'activo', new Date()]
    );
    connection.release();
    res.status(201).json({ success: true, mensaje: 'Empleado creado', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al crear empleado' });
  }
});

// ========== CRUD ASIGNACIONES ==========

app.get('/api/asignaciones', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [asignaciones] = await connection.query(
      'SELECT a.*, e.nombre as empleado_nombre FROM asignaciones a LEFT JOIN empleados e ON a.empleado_id = e.id ORDER BY a.fecha_asignacion DESC'
    );
    connection.release();
    res.json({ success: true, data: asignaciones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener asignaciones' });
  }
});

app.post('/api/asignaciones', async (req, res) => {
  try {
    const { reclamo_id, empleado_id, fecha_limite_resolucion, prioridad, observaciones } = req.body;
    if (!reclamo_id || !empleado_id) return res.status(400).json({ success: false, error: 'Campos requeridos' });
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO asignaciones (reclamo_id, empleado_id, fecha_limite_resolucion, prioridad, observaciones, estado) VALUES (?, ?, ?, ?, ?, ?)',
      [reclamo_id, empleado_id, fecha_limite_resolucion || null, prioridad || 'media', observaciones || null, 'pendiente']
    );
    connection.release();
    res.status(201).json({ success: true, mensaje: 'Asignación creada', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al crear asignación' });
  }
});

app.put('/api/asignaciones/:id', async (req, res) => {
  try {
    const { estado, observaciones } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE asignaciones SET estado = ?, observaciones = ? WHERE id = ?',
      [estado, observaciones || null, req.params.id]
    );
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Asignación no encontrada' });
    res.json({ success: true, mensaje: 'Asignación actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al actualizar asignación' });
  }
});

app.delete('/api/asignaciones/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM asignaciones WHERE id = ?', [req.params.id]);
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Asignación no encontrada' });
    res.json({ success: true, mensaje: 'Asignación eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al eliminar asignación' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'ms-asignacion' }));

app.listen(PORT, () => console.log(`✓ Microservicio de Asignación en puerto ${PORT}`));
