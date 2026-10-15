-- Coordenadas aproximadas corrigidas para os hospitais identificados no resultado
-- de teste compartilhado. Confira IDs e nomes antes de executar no seu banco.

UPDATE hospital
SET latitude = -30.04924, longitude = -51.20902
WHERE id = 1 AND nome = 'Instituto de Cardiologia';

UPDATE hospital
SET latitude = -30.03691, longitude = -51.20983
WHERE id = 3 AND nome = 'HPS - Hospital de Pronto Socorro';

UPDATE hospital
SET latitude = -30.05504, longitude = -51.17580
WHERE id = 4 AND nome = 'Hospital São Lucas da PUCRS';

-- O registro id=2 ('Hospital São Lucas', 'Avenida Ipitanga, 5010') não é
-- alterado: nome/endereço não identificam com segurança uma unidade específica.
-- Como o app ignora coordenadas (0, 0), ele não criará um marcador falso para ele.
