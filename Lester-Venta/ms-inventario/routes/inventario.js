module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();

  // GET todos los inventario
  router.get('/', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(`SELECT * FROM inventario`);
      connection.release();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET inventario por ID
  router.get('/:id', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(`SELECT * FROM inventario WHERE id = ?`, [req.params.id]);
      connection.release();
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST crear nuevo inventario
  router.post('/', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(`INSERT INTO inventario SET ?`, req.body);
      connection.release();
      res.json({ id: result.insertId, ...req.body });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT actualizar inventario
  router.put('/:id', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.query(`UPDATE inventario SET ? WHERE id = ?`, [req.body, req.params.id]);
      connection.release();
      res.json({ id: req.params.id, ...req.body });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE inventario
  router.delete('/:id', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.query(`DELETE FROM inventario WHERE id = ?`, [req.params.id]);
      connection.release();
      res.json({ message: 'Eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
