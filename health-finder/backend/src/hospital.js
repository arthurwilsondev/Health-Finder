import { Router } from "express";

export default function Hospital(app, db) {

    const router = Router();

    router.post("/hospital", async (req, res) => {
        try {
            const { nome, endereco, altitude, latitude, longitude } = req.body;


            const sql = `
                    INSERT INTO hospital (nome, endereco, altitude, longitude, latitude)
                    VALUES (?, ?, ?, ?, ?)
                `;

            const [result] = await db.query(sql, [
                nome, endereco, altitude, longitude, latitude
            ]);

            res.status(201).json({
                mensagem: "Hospital cadastrado com sucesso",
                idHospital: result.insertId
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao inserir hospital" });
        }
    });

    router.get("/hospital", async (req, res) => {
        try {
            const categoriaId = req.query.categoriaId;

            if (categoriaId !== undefined) {
                const id = String(categoriaId);
                if (!/^\d+$/.test(id) || Number(id) < 1) {
                    return res.status(400).json({
                        erro: "O parâmetro categoriaId deve ser um ID numérico positivo."
                    });
                }

                // Esta consulta depende da tabela criada em:
                // backend/sql/02-hospital-atendimento-categoria.sql
                const sql = `
                    SELECT h.*
                    FROM hospital h
                    INNER JOIN hospital_atendimento_categoria hac
                        ON hac.hospital_id = h.id
                    WHERE hac.categoria_id = ?
                    ORDER BY h.nome
                `;
                const [rows] = await db.query(sql, [Number(id)]);
                return res.status(200).json(rows);
            }

            const [rows] = await db.query('SELECT * FROM hospital ORDER BY nome');
            return res.status(200).json(rows);
        } catch (error) {
            console.error("Erro ao consultar hospitais:", error);
            res.status(500).json({
                error: "Erro na consulta ao banco. Verifique a conexão e, ao filtrar, a tabela hospital_atendimento_categoria."
            });
        }
    });

    
    app.use("/", router);

}
