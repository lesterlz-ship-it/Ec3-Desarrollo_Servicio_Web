const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'alejo-reclamos_resolucion',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'resolucion', port: 3005 });
});

// API Routes
app.use('/api/resolucion', require('./routes/resolucion.js')(pool));

app.listen(3005, () => {
  console.log(`resolucion microservice running on port 3005`);
});
