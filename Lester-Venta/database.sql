-- ==========================================
-- SQL Script: Alejo-Reclamos - 7 Microservicios
-- Generado: 2026-02-26
-- ==========================================

-- ==========================================
-- 1. Microservicio: ms-clientes
-- Base de datos: alejo_clientes
-- ==========================================
DROP DATABASE IF EXISTS alejo_clientes;
CREATE DATABASE alejo_clientes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alejo_clientes;

CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  ciudad VARCHAR(50),
  pais VARCHAR(50),
  tipo_cliente ENUM('natural', 'juridica') DEFAULT 'natural',
  estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO clientes (nombre, email, telefono, direccion, ciudad, pais, tipo_cliente, estado) VALUES
('Juan García Pérez', 'juan.garcia@example.com', '+51987654321', 'Av. Principal 123', 'Lima', 'Perú', 'natural', 'activo'),
('María López Sánchez', 'maria.lopez@example.com', '+51987654322', 'Calle Secundaria 456', 'Arequipa', 'Perú', 'natural', 'activo'),
('Carlos Rodríguez Martínez', 'carlos.rodriguez@example.com', '+51987654323', 'Jr. Tercera 789', 'Cusco', 'Perú', 'natural', 'activo'),
('Ana Martínez García', 'ana.martinez@example.com', '+51987654324', 'Av. Cuarta 101', 'Lima', 'Perú', 'natural', 'activo'),
('Empresa XYZ S.A.C.', 'contacto@empresaxyz.com', '+51987654325', 'Av. Industrial 200', 'Lima', 'Perú', 'juridica', 'activo');

-- ==========================================
-- 2. Microservicio: ms-reclamos
-- Base de datos: alejo_reclamos
-- ==========================================
DROP DATABASE IF EXISTS alejo_reclamos;
CREATE DATABASE alejo_reclamos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alejo_reclamos;

CREATE TABLE IF NOT EXISTS reclamos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_reclamo VARCHAR(20) UNIQUE NOT NULL,
  cliente_nombre VARCHAR(100) NOT NULL,
  cliente_email VARCHAR(100),
  cliente_telefono VARCHAR(20),
  tipo_reclamo ENUM('defecto', 'incumplimiento', 'negligencia', 'daño', 'otro') DEFAULT 'defecto',
  descripcion TEXT NOT NULL,
  monto_reclamado DECIMAL(10,2),
  estado ENUM('registrado', 'en_investigacion', 'evaluado', 'resuelto', 'cerrado') DEFAULT 'registrado',
  fecha_reclamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_resolucion DATETIME,
  INDEX idx_estado (estado),
  INDEX idx_tipo (tipo_reclamo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO reclamos (numero_reclamo, cliente_nombre, cliente_email, cliente_telefono, tipo_reclamo, descripcion, monto_reclamado) VALUES
('REC-001-2026', 'Juan García', 'juan@example.com', '987654321', 'defecto', 'Laptop con defecto en pantalla', 1299.99),
('REC-002-2026', 'María López', 'maria@example.com', '987654322', 'incumplimiento', 'No recibí el producto en la fecha indicada', 500.00),
('REC-003-2026', 'Carlos Rodríguez', 'carlos@example.com', '987654323', 'negligencia', 'Producto dañado en envío', 150.00),
('REC-004-2026', 'Ana Martínez', 'ana@example.com', '987654324', 'daño', 'Daño colateral por producto defectuoso', 300.00);
  

-- ==========================================
-- Microservicio: ms-evaluacion
-- Base de datos: alejo_reclamos_evaluacion
-- ==========================================
DROP DATABASE IF EXISTS alejo_reclamos_evaluacion;
CREATE DATABASE alejo_reclamos_evaluacion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alejo_reclamos_evaluacion;

CREATE TABLE IF NOT EXISTS evaluacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reclamo_id INT NOT NULL,
  evaluador VARCHAR(100),
  fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  veredicto ENUM('procedente', 'improcedente', 'parcialmente_procedente') DEFAULT 'procedente',
  argumento_legal TEXT,
  recomendacion TEXT,
  INDEX idx_reclamo (reclamo_id),
  INDEX idx_veredicto (veredicto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO evaluacion (reclamo_id, evaluador, veredicto, argumento_legal) VALUES
(1, 'Abog. Patricia García', 'procedente', 'Garantía de producto aplica por defecto de fabricación'),
(2, 'Abog. Roberto Silva', 'procedente', 'Incumplimiento de plazo de entrega según contrato'),
(3, 'Abog. Patricia García', 'parcialmente_procedente', 'Responsabilidad compartida con transporte');
  

-- ==========================================
-- Microservicio: ms-procesos
-- Base de datos: alejo_reclamos_procesos
-- ==========================================
DROP DATABASE IF EXISTS alejo_reclamos_procesos;
CREATE DATABASE alejo_reclamos_procesos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alejo_reclamos_procesos;

CREATE TABLE IF NOT EXISTS procesos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reclamo_id INT NOT NULL,
  numero_tramite VARCHAR(20) UNIQUE,
  tipo_tramite ENUM('administrativo', 'judicial', 'arbitraje') DEFAULT 'administrativo',
  estado ENUM('en_tramite', 'en_litigio', 'resuelto', 'apelado') DEFAULT 'en_tramite',
  abogado_asignado VARCHAR(100),
  juzgado VARCHAR(100),
  fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_resolucion DATETIME,
  FOREIGN KEY (reclamo_id) REFERENCES reclamos(id),
  INDEX idx_reclamo (reclamo_id),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO procesos (reclamo_id, numero_tramite, tipo_tramite, estado, abogado_asignado) VALUES
(1, 'TRM-001-2026', 'administrativo', 'resuelto', 'Abog. Patricia García'),
(2, 'TRM-002-2026', 'judicial', 'en_tramite', 'Abog. Roberto Silva'),
(3, 'TRM-003-2026', 'administrativo', 'en_tramite', 'Abog. Patricia García'),
(4, 'TRM-004-2026', 'arbitraje', 'resuelto', 'Abog. Carlos Mendoza');
  

-- ==========================================
-- Microservicio: ms-evidencia
-- Base de datos: alejo_reclamos_evidencia
-- ==========================================
DROP DATABASE IF EXISTS alejo_reclamos_evidencia;
CREATE DATABASE alejo_reclamos_evidencia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alejo_reclamos_evidencia;

CREATE TABLE IF NOT EXISTS evidencia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reclamo_id INT NOT NULL,
  tipo_evidencia ENUM('foto', 'video', 'documento', 'audio', 'correo') DEFAULT 'foto',
  descripcion VARCHAR(200),
  ruta_archivo VARCHAR(255),
  fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reclamo_id) REFERENCES reclamos(id),
  INDEX idx_reclamo (reclamo_id),
  INDEX idx_tipo (tipo_evidencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO evidencia (reclamo_id, tipo_evidencia, descripcion, ruta_archivo) VALUES
(1, 'foto', 'Pantalla defectuosa', 'evidencia/rec-001-foto-1.jpg'),
(1, 'documento', 'Recibo de compra', 'evidencia/rec-001-recibo.pdf'),
(2, 'email', 'Confirmación de pedido', 'evidencia/rec-002-email-1.eml'),
(3, 'foto', 'Empaque dañado', 'evidencia/rec-003-foto-1.jpg'),
(3, 'foto', 'Producto dañado', 'evidencia/rec-003-foto-2.jpg');
  

-- ==========================================
-- Microservicio: ms-resolucion
-- Base de datos: alejo_reclamos_resolucion
-- ==========================================
DROP DATABASE IF EXISTS alejo_reclamos_resolucion;
CREATE DATABASE alejo_reclamos_resolucion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alejo_reclamos_resolucion;

CREATE TABLE IF NOT EXISTS resolucion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reclamo_id INT NOT NULL,
  tipo_resolucion ENUM('devolución', 'compensación', 'reemplazo', 'reparación') DEFAULT 'devolución',
  monto_otorgado DECIMAL(10,2),
  descripcion_resolucion TEXT,
  estado ENUM('pendiente', 'ejecutada', 'pagada') DEFAULT 'pendiente',
  fecha_resolucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_cumplimiento DATETIME,
  FOREIGN KEY (reclamo_id) REFERENCES reclamos(id),
  INDEX idx_reclamo (reclamo_id),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO resolucion (reclamo_id, tipo_resolucion, monto_otorgado, descripcion_resolucion, estado) VALUES
(1, 'devolución', 1299.99, 'Reembolso total por producto defectuoso', 'ejecutada'),
(2, 'compensación', 100.00, 'Compensación por incumplimiento de plazo', 'pagada'),
(3, 'reemplazo', 150.00, 'Reemplazo de producto dañado', 'pendiente'),
(4, 'compensación', 150.00, 'Compensación por daños asociados', 'pagada');
  

-- ==========================================
-- Microservicio: ms-seguimiento-reclamos
-- Base de datos: alejo_reclamos_seguimiento_reclamos
-- ==========================================
DROP DATABASE IF EXISTS alejo_reclamos_seguimiento_reclamos;
CREATE DATABASE alejo_reclamos_seguimiento_reclamos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alejo_reclamos_seguimiento_reclamos;

CREATE TABLE IF NOT EXISTS seguimiento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reclamo_id INT NOT NULL,
  evento ENUM('creado', 'evaluado', 'resuelto', 'pagado', 'apelado') DEFAULT 'creado',
  descripcion TEXT,
  usuario_responsable VARCHAR(100),
  fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reclamo_id) REFERENCES reclamos(id),
  INDEX idx_reclamo (reclamo_id),
  INDEX idx_evento (evento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO seguimiento (reclamo_id, evento, descripcion, usuario_responsable) VALUES
(1, 'creado', 'Reclamo registrado en sistema', 'Admin'),
(1, 'evaluado', 'Evaluación completada - Procedente', 'Abog. Patricia García'),
(1, 'resuelto', 'Resolución dictada - Devolución completa', 'Abog. Patricia García'),
(1, 'pagado', 'Reembolso ejecutado', 'Finanzas'),
(2, 'creado', 'Reclamo registrado en sistema', 'Admin'),
(2, 'evaluado', 'En evaluación', 'Abog. Roberto Silva');
  

-- ==========================================
-- Microservicio: ms-reportes-reclamos
-- Base de datos: alejo_reclamos_reportes_reclamos
-- ==========================================
DROP DATABASE IF EXISTS alejo_reclamos_reportes_reclamos;
CREATE DATABASE alejo_reclamos_reportes_reclamos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alejo_reclamos_reportes_reclamos;

CREATE TABLE IF NOT EXISTS reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_reporte VARCHAR(50),
  periodo VARCHAR(20),
  reclamos_totales INT,
  reclamos_procedentes INT,
  reclamos_improcedentes INT,
  monto_total_compensado DECIMAL(12,2),
  tasa_resolucion DECIMAL(5,2),
  tiempo_promedio_resolucion DECIMAL(5,1),
  tipos_reclamos_frecuentes VARCHAR(255),
  fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipo_reporte),
  INDEX idx_periodo (periodo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO reportes (tipo_reporte, periodo, reclamos_totales, reclamos_procedentes, reclamos_improcedentes, monto_total_compensado, tasa_resolucion, tiempo_promedio_resolucion) VALUES
('mensual', '2026-02', 4, 3, 0, 1649.99, 75.00, 5.5),
('trimestral', '2026-Q1', 4, 3, 0, 1649.99, 75.00, 5.5);
  
