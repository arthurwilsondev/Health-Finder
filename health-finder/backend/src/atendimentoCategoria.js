import { Router } from "express"

export default function AtendimentoCategoria(app, db) {
    const router = Router();

    router.get("/atendimentoCategoria", async (req, res) => {
        try {
            const sql = 'SELECT * FROM atendimento_categoria';
            const [rows] = await db.query(sql);

            res.status(200).json(rows);
        } catch(error) {
            console.error(error);
            res.status(500).json({ error: 'Erro na consulta ao banco' });
        }
    });
    
    router.post("/atendimentoCategoria", async (req, res) => {
        try {
            const { nome } = req.body;


            const sql = `
                    INSERT INTO atendimento_categoria (nome)
                    VALUES (?)
                `;

            const [result] = await db.query(sql, [
                nome
            ]);

            res.status(201).json({
                mensagem: "Atendimento cadastrado com sucesso",
                idAtendimento: result.insertId
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao inserir Atendimento" });
        }
    });


    app.use("/", router)
}