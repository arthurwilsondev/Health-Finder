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
            const sql = 'SELECT * FROM hospital';
            const [rows] = await db.query(sql);

            res.status(200).json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro na consulta ao banco' });
        }
    });

    
    app.use("/", router);

}