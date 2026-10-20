import { Router } from "express";
import autenticarToken from "./autenticacao.js";
import bcrypt from "bcryptjs";

export default function Usuario(app, db) {

    const router = Router();


    /**
     * @openapi
     * /usuarios:
     *   get:
     *     summary: Listar pessoas
     *     description: Retorna uma lista de pessoas cadastradas. Requer autenticação JWT.
     *     tags:
     *       - Pessoa
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de pessoas retornada com sucesso.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   idPessoa:
     *                     type: integer
     *                     example: 1
     *                   nome:
     *                     type: string
     *                     example: João da Silva
     *                   rg:
     *                     type: string
     *                     example: "123456789"
     *                   cpf:
     *                     type: string
     *                     example: "98765432100"
     *                   dtanascimento:
     *                     type: string
     *                     format: date
     *                     example: "1990-05-20"
     *                   foto:
     *                     type: string
     *                     format: binary
     *                     example: "binary data"
     *       401:
     *         description: Token não informado.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 erro:
     *                   type: string
     *                   example: Token não informado
     *       403:
     *         description: Token inválido ou expirado.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 erro:
     *                   type: string
     *                   example: Token inválido
     *       500:
     *         description: Erro na consulta ao banco de dados.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Erro na consulta ao banco
     */
    router.get("/usuarios", autenticarToken, async (req, res) => {
        try {
            const sql = 'SELECT * FROM usuario';
            const [rows] = await db.query(sql);

            res.status(200).json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro na consulta ao banco' });
        }
    });

    /**
     * @openapi
     * /Pessoa/{idPessoa}:
     *   get:
     *     summary: Obter pessoa por ID
     *     description: Retorna os dados de uma pessoa específica. Requer autenticação JWT.
     *     tags:
     *       - Pessoa
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: idPessoa
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Pessoa encontrada com sucesso.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 idPessoa:
     *                   type: integer
     *                   example: 1
     *                 nome:
     *                   type: string
     *                   example: João da Silva
     *                 rg:
     *                   type: string
     *                   example: "123456789"
     *                 cpf:
     *                   type: string
     *                   example: "98765432100"
     *                 dtanascimento:
     *                   type: string
     *                   format: date
     *                   example: "1990-05-20"
     *                 foto:
     *                   type: string
     *                   format: binary
     *                   example: "binary data"
     *       401:
     *         description: Token não informado.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 erro:
     *                   type: string
     *                   example: Token não informado
     *       403:
     *         description: Token inválido ou expirado.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 erro:
     *                   type: string
     *                   example: Token inválido
     *       404:
     *         description: Pessoa não encontrada.
     *       500:
     *         description: Erro na consulta ao banco de dados.
    */
    router.get("/Usuario/:idPessoa", autenticarToken, async (req, res) => {
        try {
            const { idPessoa } = req.params;
            const sql = 'SELECT * FROM usuario WHERE idPessoa = ?';
            const [rows] = await db.query(sql, [idPessoa]);

            if (rows.length === 0) {
                return res.status(404).json({ erro: "Usuario não encontrada" });
            }

            res.status(200).json(rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro na consulta ao banco' });
        }
    });


    /**
         * @openapi
         * /Inserir:
         *   post:
         *     summary: Incluir pessoa
         *     description: Cadastra uma nova pessoa no sistema. Requer autenticação JWT.
         *     tags:
         *       - Pessoa
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - nome
         *               - rg
         *               - cpf
         *               - dtanascimento
         *             properties:
         *               nome:
         *                 type: string
         *               rg:
         *                 type: string
         *               cpf:
         *                 type: string
         *               dtanascimento:
         *                 type: string
         *                 format: date
         *               foto:
         *                 type: string
         *                 format: binary
         *     responses:
         *       201:
         *         description: Pessoa cadastrada com sucesso.
         *       400:
         *         description: Dados inválidos.
         *       500:
         *         description: Erro ao inserir pessoa.
         */
    router.post("/usuarios", async (req, res) => {
        try {
            const { nome, email, senha } = req.body;

            const senhaHash = await bcrypt.hash(senha, 10);

            const sql = `
                INSERT INTO usuario (nome, email, senha)
                VALUES (?, ?, ?)
            `;

            const [result] = await db.query(sql, [
                nome, email, senhaHash
            ]);

            res.status(201).json({
                mensagem: "Pessoa cadastrada com sucesso",
                idPessoa: result.insertId
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao inserir pessoa" });
        }
    });


    /**
    * @openapi
    * /AlterarPessoa/{idPessoa}:
    *   put:
    *     summary: Editar pessoa
    *     description: Atualiza os dados de uma pessoa existente. Requer autenticação JWT.
    *     tags:
    *       - Pessoa
    *     security:
    *       - bearerAuth: []
    *     parameters:
    *       - in: path
    *         name: idPessoa
    *         required: true
    *         schema:
    *           type: integer
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             properties:
    *               nome:
    *                 type: string
    *               rg:
    *                 type: string
    *               cpf:
    *                 type: string
    *               dtanascimento:
    *                 type: string
    *                 format: date
    *               foto:
    *                 type: string
    *                 format: binary
    *     responses:
    *       200:
    *         description: Pessoa atualizada com sucesso.
    *       404:
    *         description: Pessoa não encontrada.
    *       500:
    *         description: Erro ao atualizar pessoa.
    */
    router.put("/AlterarPessoa/:idPessoa", autenticarToken, async (req, res) => {
        try {
            const { idPessoa } = req.params;
            const { nome, rg, cpf, dtanascimento, foto } = req.body;

            const campos = [];
            const valores = [];

            if (nome !== undefined) {
                campos.push("nome = ?");
                valores.push(nome);
            }

            if (rg !== undefined) {
                campos.push("rg = ?");
                valores.push(rg);
            }

            if (cpf !== undefined) {
                campos.push("cpf = ?");
                valores.push(cpf);
            }

            if (dtanascimento !== undefined) {
                campos.push("dtanascimento = ?");
                valores.push(dtanascimento);
            }

            if (foto !== undefined) {
                campos.push("foto = ?");
                valores.push(foto);
            }

            if (campos.length === 0) {
                return res.status(400).json({
                    erro: "Nenhum campo informado para atualização"
                });
            }

            const sql = `UPDATE Pessoa
                        SET ${campos.join(", ")}
                        WHERE idPessoa = ?`;                       

            valores.push(idPessoa);

            const [result] = await db.query(sql, valores);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    erro: "Pessoa não encontrada"
                });
            }

            res.status(200).json({
                mensagem: "Pessoa atualizada com sucesso"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                erro: "Erro ao atualizar pessoa"
            });
        }
    });

    /**
     * @openapi
     * /DeletarPessoas/{idPessoa}:
     *   delete:
     *     summary: Remover pessoa
     *     description: Exclui uma pessoa do sistema. Requer autenticação JWT.
     *     tags:
     *       - Pessoa
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: idPessoa
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Pessoa removida com sucesso.
     *       404:
     *         description: Pessoa não encontrada.
     *       500:
     *         description: Erro ao remover pessoa.
     */
    router.delete("/DeletarPessoas/:idPessoa", autenticarToken, async (req, res) => {
        try {
            const { idPessoa } = req.params;

            const sql = `DELETE FROM Pessoa WHERE idPessoa = ?`;
            const [result] = await db.query(sql, [idPessoa]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ erro: "Pessoa não encontrada" });
            }

            res.status(200).json({ mensagem: "Pessoa removida com sucesso" });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao remover pessoa" });
        }
    });

    app.use("/", router);

}