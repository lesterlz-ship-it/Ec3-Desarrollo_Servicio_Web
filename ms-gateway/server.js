const express = require('express');
const proxy = require('express-http-proxy');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura_2026';

// Middleware de Validación JWT centralizado en el Gateway
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token requerido' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token inválido' });
  }
};

// --- RUTAS DE ENRUTAMIENTO (Proxy) ---

// 1. Alejo-Reclamos
app.use('/alejo/clientes', verifyToken, proxy('http://alejo-clientes:3001'));
app.use('/alejo/categorizacion', verifyToken, proxy('http://alejo-categorizacion:3002'));
app.use('/alejo/asignacion', verifyToken, proxy('http://alejo-asignacion:3003'));
app.use('/alejo/evaluacion', verifyToken, proxy('http://alejo-evaluacion:3004'));
app.use('/alejo/evidencia', verifyToken, proxy('http://alejo-evidencia:3005'));
app.use('/alejo/reportes', verifyToken, proxy('http://alejo-reportes:3006'));
app.use('/alejo/seguimiento', verifyToken, proxy('http://alejo-seguimiento:3007'));

// 2. Ariana-Compra
app.use('/ariana/almacen', verifyToken, proxy('http://ariana-almacen:3008'));
app.use('/ariana/cotizaciones', verifyToken, proxy('http://ariana-cotizaciones:3009'));
app.use('/ariana/inspeccion-calidad', verifyToken, proxy('http://ariana-inspeccion-calidad:3010'));
app.use('/ariana/ordenes-compra', verifyToken, proxy('http://ariana-ordenes-compra:3011'));
app.use('/ariana/pagos-proveedores', verifyToken, proxy('http://ariana-pagos-proveedores:3012'));
app.use('/ariana/proveedores', verifyToken, proxy('http://ariana-proveedores:3013'));
app.use('/ariana/recepcion', verifyToken, proxy('http://ariana-recepcion:3014'));

// 3. Ayala-Asistencia
app.use('/ayala/asignaciones', verifyToken, proxy('http://ayala-asignaciones:3015'));
app.use('/ayala/asistencia', verifyToken, proxy('http://ayala-asistencia:3016'));
app.use('/ayala/categorias', verifyToken, proxy('http://ayala-categorias:3017'));
app.use('/ayala/departamentos', verifyToken, proxy('http://ayala-departamentos:3018'));
app.use('/ayala/empleados', verifyToken, proxy('http://ayala-empleados:3019'));
app.use('/ayala/estadisticas', verifyToken, proxy('http://ayala-estadisticas:3020'));
app.use('/ayala/horarios', verifyToken, proxy('http://ayala-horarios:3021'));

// 4. Lester-Venta
app.use('/lester/carrito', verifyToken, proxy('http://lester-carrito:3022'));
app.use('/lester/clientes', verifyToken, proxy('http://lester-clientes:3023'));
app.use('/lester/descuentos', verifyToken, proxy('http://lester-descuentos:3024'));
app.use('/lester/inventario', verifyToken, proxy('http://lester-inventario:3025'));
app.use('/lester/notificaciones', verifyToken, proxy('http://lester-notificaciones:3026'));
app.use('/lester/pagos', verifyToken, proxy('http://lester-pagos:3027'));
app.use('/lester/pedidos', verifyToken, proxy('http://lester-pedidos:3028'));

// 5. Miguel-Alquileres
app.use('/miguel/contratos', verifyToken, proxy('http://miguel-contratos:3029'));
app.use('/miguel/facturas', verifyToken, proxy('http://miguel-facturas:3030'));
app.use('/miguel/inquilinos', verifyToken, proxy('http://miguel-inquilinos:3031'));
app.use('/miguel/mantenimiento', verifyToken, proxy('http://miguel-mantenimiento:3032'));
app.use('/miguel/multas', verifyToken, proxy('http://miguel-multas:3033'));
app.use('/miguel/pagos', verifyToken, proxy('http://miguel-pagos-alquiler:3034'));
app.use('/miguel/propiedades', verifyToken, proxy('http://miguel-propiedades:3035'));

app.post('/api/auth/login', proxy('http://ms-auth:3036/api/auth/login'));
app.use('/api/auth', proxy('http://ms-auth:3036'));

// Health check para el Gateway
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'ms-gateway', port: PORT });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
