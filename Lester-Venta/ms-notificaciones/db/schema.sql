DROP DATABASE IF EXISTS alejo_evidencia;
CREATE DATABASE alejo_evidencia;
USE alejo_evidencia;
CREATE TABLE evidencia (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reclamo_id INT,
  tipo VARCHAR(50),
  descripcion TEXT,
  url_archivo VARCHAR(255),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
