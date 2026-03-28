const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3036;
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura_2026';

// Usuarios de prueba (Hardcoded para demostración académica)
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'administrador' },
  { id: 2, username: 'usuario', password: 'user123', role: 'usuario' }
];

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }

  // Generar Token
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    success: true,
    message: 'Autenticación exitosa',
    token: token
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'ms-auth', port: PORT });
});

app.listen(PORT, () => {
  console.log(`ms-auth running on port ${PORT}`);
});
