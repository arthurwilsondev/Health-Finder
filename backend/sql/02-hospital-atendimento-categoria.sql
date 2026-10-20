
CREATE TABLE IF NOT EXISTS hospital_atendimento_categoria (
    hospital_id INT NOT NULL,
    categoria_id INT NOT NULL,
    PRIMARY KEY (hospital_id, categoria_id),
    INDEX idx_hac_categoria_id (categoria_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

