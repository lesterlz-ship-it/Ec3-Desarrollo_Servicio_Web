-- Microservicio de Evaluación de Reclamos
CREATE DATABASE IF NOT EXISTS alejo_evaluacion;
USE alejo_evaluacion;

CREATE TABLE evaluaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reclamo_id INT NOT NULL,
  asignacion_id INT,
  calidad_atencion INT,
  tiempo_respuesta INT,
  resolucion_efectiva INT,
  comentarios TEXT,
  fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  evaluador_id INT,
  estado VARCHAR(20) DEFAULT 'completada'
);

CREATE TABLE criterios_evaluacion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  peso INT DEFAULT 1,
  escala_minima INT DEFAULT 1,
  escala_maxima INT DEFAULT 5,
  estado VARCHAR(20) DEFAULT 'activo'
);

CREATE INDEX idx_reclamo ON evaluaciones(reclamo_id);
CREATE INDEX idx_evaluador ON evaluaciones(evaluador_id);
