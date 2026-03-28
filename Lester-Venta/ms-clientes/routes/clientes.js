module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();

  // GET todos los clientes
  router.get('/', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(`SELECT * FROM clientes`);
      connection.release();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET clientes por ID
  router.get('/:id', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(`SELECT * FROM clientes WHERE id = ?`, [req.params.id]);
      connection.release();
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST crear nuevo clientes
  router.post('/', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(`INSERT INTO clientes SET ?`, req.body);
      connection.release();
      res.json({ id: result.insertId, ...req.body });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT actualizar clientes
  router.put('/:id', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.query(`UPDATE clientes SET ? WHERE id = ?`, [req.body, req.params.id]);
      connection.release();
      res.json({ id: req.params.id, ...req.body });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE clientes
  router.delete('/:id', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.query(`DELETE FROM clientes WHERE id = ?`, [req.params.id]);
      connection.release();
      res.json({ message: 'Eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
