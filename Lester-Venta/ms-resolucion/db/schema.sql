DROP DATABASE IF EXISTS alejo_resolucion;
CREATE DATABASE alejo_resolucion;
USE alejo_resolucion;
CREATE TABLE resoluciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reclamo_id INT,
  tipo_resolucion VARCHAR(50),
  monto_compensacion DECIMAL(12, 2),
  descripcion TEXT,
  fecha_resolucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
