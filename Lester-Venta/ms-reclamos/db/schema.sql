DROP DATABASE IF EXISTS alejo_reclamos;
CREATE DATABASE alejo_reclamos;
USE alejo_reclamos;
CREATE TABLE reclamos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT,
  descripcion TEXT,
  tipo VARCHAR(50),
  monto DECIMAL(12, 2),
  estado VARCHAR(20),
  fecha_reclamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO reclamos (cliente_id, descripcion, tipo, monto, estado) VALUES (1, 'Producto defectuoso', 'defecto', 500.00, 'registrado');
CREATE INDEX idx_cliente ON reclamos(cliente_id);
