-- Microservicio de Seguimiento de Reclamos
CREATE DATABASE IF NOT EXISTS alejo_seguimiento;
USE alejo_seguimiento;

CREATE TABLE reclamos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  numero_reclamo VARCHAR(50) UNIQUE,
  descripcion TEXT NOT NULL,
  categoria_id INT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_resolucion TIMESTAMP NULL,
  estado VARCHAR(20) DEFAULT 'abierto',
  prioridad VARCHAR(20) DEFAULT 'media',
  monto_reclamado DECIMAL(10, 2),
  monto_compensacion DECIMAL(10, 2) NULL
);

CREATE TABLE seguimiento_reclamos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reclamo_id INT NOT NULL,
  estado_anterior VARCHAR(20),
  estado_nuevo VARCHAR(20),
  comentario TEXT,
  usuario_actualizacion INT,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reclamo_id) REFERENCES reclamos(id) ON DELETE CASCADE
);

CREATE TABLE historial_estado (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reclamo_id INT NOT NULL,
  estado VARCHAR(20),
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  razon TEXT,
  FOREIGN KEY (reclamo_id) REFERENCES reclamos(id) ON DELETE CASCADE
);

CREATE INDEX idx_cliente ON reclamos(cliente_id);
CREATE INDEX idx_estado ON reclamos(estado);
CREATE INDEX idx_reclamo_seguimiento ON seguimiento_reclamos(reclamo_id);
