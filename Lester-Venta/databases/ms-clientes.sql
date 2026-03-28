-- Microservicio de Clientes
CREATE DATABASE IF NOT EXISTS lester_clientes;
USE lester_clientes;

CREATE TABLE clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  documento_identidad VARCHAR(20) UNIQUE,
  direccion TEXT,
  ciudad VARCHAR(50),
  estado VARCHAR(20) DEFAULT 'activo',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON clientes(email);
CREATE INDEX idx_documento ON clientes(documento_identidad);
