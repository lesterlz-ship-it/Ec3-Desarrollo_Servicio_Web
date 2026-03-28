-- Microservicio de Evidencia de Reclamos
CREATE DATABASE IF NOT EXISTS alejo_evidencia;
USE alejo_evidencia;

CREATE TABLE evidencias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reclamo_id INT NOT NULL,
  tipo_evidencia VARCHAR(50),
  descripcion TEXT,
  archivo_nombre VARCHAR(255),
  archivo_ruta VARCHAR(500),
  archivo_tamaño INT,
  archivo_tipo VARCHAR(50),
  fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_carga INT,
  estado VARCHAR(20) DEFAULT 'registrada',
  fecha_verificacion TIMESTAMP NULL,
  verificado_por INT NULL
);

CREATE TABLE tipos_evidencia (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  permitidos_formatos VARCHAR(255),
  tamaño_maximo_mb INT DEFAULT 10,
  estado VARCHAR(20) DEFAULT 'activo'
);

CREATE INDEX idx_reclamo ON evidencias(reclamo_id);
CREATE INDEX idx_usuario ON evidencias(usuario_carga);
