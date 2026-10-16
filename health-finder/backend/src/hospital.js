import { Router } from "express";
import autenticarToken from "./autenticacao.js";

const ASSOCIATION_TABLE = "hospital_atendimento_categoria";

function normalizarColuna(value) {
    return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function obterColunasAssociacao(db) {
    const [rows] = await db.query(`SHOW COLUMNS FROM ${ASSOCIATION_TABLE}`);
    const colunas = rows.map((row) => String(row.Field));
    const porNomeNormalizado = new Map(colunas.map((coluna) => [normalizarColuna(coluna), coluna]));
    const hospital = ["hospitalid", "idhospital"]
        .map((nome) => porNomeNormalizado.get(nome)).find(Boolean);
    const categoria = [
        "categoriaid", "idcategoria", "atendimentocategoriaid",
        "idatendimentocategoria", "idcategoriaatendimento", "atendimentoid", "idatendimento"
    ].map((nome) => porNomeNormalizado.get(nome)).find(Boolean);

    if (!hospital || !categoria) {
        throw new Error(
            `A tabela ${ASSOCIATION_TABLE} não tem colunas de associação reconhecidas. Colunas encontradas: ${colunas.join(", ") || "nenhuma"}.`
        );
    }
    return { hospital, categoria };
}

function quoted(identifier) {
    return `\`${identifier.replace(/`/g, "``")}\``;
}

export default function Hospital(app, db) {
    const router = Router();

    router.post("/hospital", async (req, res) => {
        try {
            const { nome, endereco, altitude, latitude, longitude } = req.body ?? {};
            if (typeof nome !== "string" || !nome.trim()) {
                return res.status(400).json({ erro: "O campo nome é obrigatório." });
            }
            if (typeof endereco !== "string" || !endereco.trim()) {
                return res.status(400).json({ erro: "O campo endereco é obrigatório." });
            }

            const sql = `
                INSERT INTO hospital (nome, endereco, altitude, longitude, latitude)
                VALUES (?, ?, ?, ?, ?)
            `;
            const [result] = await db.query(sql, [
                nome.trim(), endereco.trim(), altitude ?? null, longitude ?? null, latitude ?? null
            ]);
            return res.status(201).json({
                mensagem: "Hospital cadastrado com sucesso",
                idHospital: result.insertId
            });
        } catch (error) {
            console.error("Erro ao inserir hospital:", error);
            return res.status(500).json({ error: "Erro ao inserir hospital" });
        }
    });

    /**
     * @openapi
     * /hospital/{id}/coordenadas:
     *   post:
     *     summary: Atualizar as coordenadas de um hospital existente
     *     description: Atualiza latitude e longitude. Requer token JWT.
     *     tags:
     *       - Hospitais
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [latitude, longitude]
     *             properties:
     *               latitude:
     *                 type: number
     *                 example: -30.05504
     *               longitude:
     *                 type: number
     *                 example: -51.17580
     *     responses:
     *       200:
     *         description: Coordenadas atualizadas.
     *       400:
     *         description: ID ou coordenadas inválidos.
     *       401:
     *         description: Token não informado.
     *       403:
     *         description: Token inválido.
     *       404:
     *         description: Hospital não encontrado.
     */
    router.post("/hospital/:id/coordenadas", autenticarToken, async (req, res) => {
        try {
            const id = Number(req.params.id);
            const latitude = Number(req.body?.latitude);
            const longitude = Number(req.body?.longitude);

            if (!Number.isSafeInteger(id) || id < 1) {
                return res.status(400).json({ erro: "O ID do hospital deve ser um inteiro positivo." });
            }
            if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
                !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
                return res.status(400).json({
                    erro: "Informe latitude entre -90 e 90 e longitude entre -180 e 180."
                });
            }

            const [result] = await db.query(
                "UPDATE hospital SET latitude = ?, longitude = ? WHERE id = ?",
                [latitude, longitude, id]
            );
            if (result.affectedRows === 0) {
                const [rows] = await db.query("SELECT id FROM hospital WHERE id = ? LIMIT 1", [id]);
                if (rows.length === 0) {
                    return res.status(404).json({ erro: `Hospital ${id} não encontrado.` });
                }
            }
            return res.status(200).json({
                mensagem: "Coordenadas atualizadas com sucesso.",
                hospitalId: id,
                latitude,
                longitude
            });
        } catch (error) {
            console.error("Erro ao atualizar coordenadas:", error);
            return res.status(500).json({ erro: "Não foi possível atualizar as coordenadas do hospital." });
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

                const { hospital: hospitalColuna, categoria: categoriaColuna } =
                    await obterColunasAssociacao(db);
                const sql = `
                    SELECT h.*
                    FROM hospital h
                    INNER JOIN ${ASSOCIATION_TABLE} hac
                        ON hac.${quoted(hospitalColuna)} = h.id
                    WHERE hac.${quoted(categoriaColuna)} = ?
                    ORDER BY h.nome
                `;
                const [rows] = await db.query(sql, [Number(id)]);
                return res.status(200).json(rows);
            }

            const [rows] = await db.query("SELECT * FROM hospital ORDER BY nome");
            return res.status(200).json(rows);
        } catch (error) {
            console.error("Erro ao consultar hospitais:", error);
            return res.status(500).json({
                error: "Erro ao consultar hospitais. Confira a estrutura da tabela hospital_atendimento_categoria no log do backend."
            });
        }
    });

    app.use("/", router);
}
