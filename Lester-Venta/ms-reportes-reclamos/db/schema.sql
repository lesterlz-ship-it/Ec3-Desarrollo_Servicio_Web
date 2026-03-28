DROP DATABASE IF EXISTS alejo_reportes_reclamos;
CREATE DATABASE alejo_reportes_reclamos;
USE alejo_reportes_reclamos;
CREATE TABLE reportes_resumen (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reclamos_totales INT,
  reclamos_resueltos INT,
  monto_total_compensacion DECIMAL(12, 2),
  tasa_resolucion DECIMAL(3,2)
);
INSERT INTO reportes_resumen (reclamos_totales, reclamos_resueltos, monto_total_compensacion, tasa_resolucion) VALUES (25, 20, 15000.00, 0.8);
