-- Microservicio de Asignación de Reclamos
CREATE DATABASE IF NOT EXISTS alejo_asignacion;
USE alejo_asignacion;

CREATE TABLE empleados (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  cargo VARCHAR(50),
  departamento VARCHAR(50),
  estado VARCHAR(20) DEFAULT 'activo',
  fecha_contratacion DATE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE asignaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reclamo_id INT NOT NULL,
  empleado_id INT NOT NULL,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_limite_resolucion DATE,
  prioridad VARCHAR(20),
  estado VARCHAR(20) DEFAULT 'pendiente',
  observaciones TEXT,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE SET NULL
);

CREATE INDEX idx_reclamo ON asignaciones(reclamo_id);
CREATE INDEX idx_empleado ON asignaciones(empleado_id);
CREATE INDEX idx_estado ON asignaciones(estado);
