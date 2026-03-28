-- Microservicio de Reportes de Reclamos
CREATE DATABASE IF NOT EXISTS alejo_reportes;
USE alejo_reportes;

CREATE TABLE reportes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  tipo_reporte VARCHAR(50),
  fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_inicio DATE,
  fecha_fin DATE,
  usuario_generador INT,
  estado VARCHAR(20) DEFAULT 'completado'
);

CREATE TABLE datos_reporte (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reporte_id INT NOT NULL,
  metrica VARCHAR(100),
  valor VARCHAR(255),
  orden INT,
  FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE
);

CREATE TABLE metricas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  tipo_calculo VARCHAR(50),
  estado VARCHAR(20) DEFAULT 'activo'
);

CREATE INDEX idx_reporte ON datos_reporte(reporte_id);
CREATE INDEX idx_fecha ON reportes(fecha_generacion);
