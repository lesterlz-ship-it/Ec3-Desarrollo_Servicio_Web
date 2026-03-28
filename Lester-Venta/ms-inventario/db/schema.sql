DROP DATABASE IF EXISTS alejo_evaluacion;
CREATE DATABASE alejo_evaluacion;
USE alejo_evaluacion;
CREATE TABLE evaluaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reclamo_id INT,
  evaluador_id INT,
  veredicto VARCHAR(50),
  observaciones TEXT,
  fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
