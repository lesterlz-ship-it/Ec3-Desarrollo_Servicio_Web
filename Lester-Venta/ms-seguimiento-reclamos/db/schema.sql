DROP DATABASE IF EXISTS alejo_seguimiento_reclamos;
CREATE DATABASE alejo_seguimiento_reclamos;
USE alejo_seguimiento_reclamos;
CREATE TABLE seguimiento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reclamo_id INT,
  evento VARCHAR(100),
  detalles TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
