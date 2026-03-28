-- Microservicio de Categorización de Reclamos
CREATE DATABASE IF NOT EXISTS alejo_categorizacion;
USE alejo_categorizacion;

CREATE TABLE categorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  nivel_prioridad INT DEFAULT 1,
  tiempo_respuesta_dias INT,
  estado VARCHAR(20) DEFAULT 'activo',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE subcategorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  categoria_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  estado VARCHAR(20) DEFAULT 'activo',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

CREATE INDEX idx_categoria ON subcategorias(categoria_id);
