module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();

  // GET todos los seguimiento
  router.get('/', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(`SELECT * FROM seguimiento`);
      connection.release();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET seguimiento por ID
  router.get('/:id', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(`SELECT * FROM seguimiento WHERE id = ?`, [req.params.id]);
      connection.release();
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST crear nuevo seguimiento
  router.post('/', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(`INSERT INTO seguimiento SET ?`, req.body);
      connection.release();
      res.json({ id: result.insertId, ...req.body });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT actualizar seguimiento
  router.put('/:id', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.query(`UPDATE seguimiento SET ? WHERE id = ?`, [req.body, req.params.id]);
      connection.release();
      res.json({ id: req.params.id, ...req.body });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE seguimiento
  router.delete('/:id', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.query(`DELETE FROM seguimiento WHERE id = ?`, [req.params.id]);
      connection.release();
      res.json({ message: 'Eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
