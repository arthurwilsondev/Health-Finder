-- Relaciona hospitais aos tipos de atendimento que eles oferecem.
-- Rode este script no banco usado pelo Health Finder antes de utilizar o filtro.
-- Os IDs são guardados como inteiros sem FOREIGN KEY para compatibilidade com o
-- esquema atual; associe IDs reais existentes nas duas tabelas.

CREATE TABLE IF NOT EXISTS hospital_atendimento_categoria (
    hospital_id INT NOT NULL,
    categoria_id INT NOT NULL,
    PRIMARY KEY (hospital_id, categoria_id),
    INDEX idx_hac_categoria_id (categoria_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Confira os IDs reais antes de inserir associações:
-- SELECT id, nome FROM hospital ORDER BY id;
-- SELECT * FROM atendimento_categoria ORDER BY 1;
--
-- Exemplo ilustrativo (substitua pelos IDs reais do seu banco):
-- INSERT INTO hospital_atendimento_categoria (hospital_id, categoria_id)
-- VALUES (4, 1), (4, 2);
