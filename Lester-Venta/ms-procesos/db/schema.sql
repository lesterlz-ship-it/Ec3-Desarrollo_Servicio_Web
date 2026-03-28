DROP DATABASE IF EXISTS alejo_procesos;
CREATE DATABASE alejo_procesos;
USE alejo_procesos;
CREATE TABLE procesos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reclamo_id INT,
  estado VARCHAR(50),
  descripcion TEXT,
  fecha_proceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
