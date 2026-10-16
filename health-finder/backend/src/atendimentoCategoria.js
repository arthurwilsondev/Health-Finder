import { Router } from "express";
import autenticarToken from "./autenticacao.js";

const ASSOCIATION_TABLE = "hospital_atendimento_categoria";

function normalizarColuna(value) {
    return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function obterColunasAssociacao(db) {
    // Cria a tabela somente se ela não existir. CREATE IF NOT EXISTS não altera
    // uma tabela antiga; por isso consultamos suas colunas antes de inserir.
    await db.query(`
        CREATE TABLE IF NOT EXISTS ${ASSOCIATION_TABLE} (
            hospital_id INT NOT NULL,
            categoria_id INT NOT NULL,
            PRIMARY KEY (hospital_id, categoria_id),
            INDEX idx_hac_categoria_id (categoria_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const [rows] = await db.query(`SHOW COLUMNS FROM ${ASSOCIATION_TABLE}`);
    const colunas = rows.map((row) => String(row.Field));
    const porNomeNormalizado = new Map(colunas.map((coluna) => [normalizarColuna(coluna), coluna]));

    const hospital = ["hospitalid", "idhospital"]
        .map((nome) => porNomeNormalizado.get(nome))
        .find(Boolean);
    const categoria = [
        "categoriaid",
        "idcategoria",
        "atendimentocategoriaid",
        "idatendimentocategoria",
        "idcategoriaatendimento",
        "atendimentoid",
        "idatendimento"
    ].map((nome) => porNomeNormalizado.get(nome)).find(Boolean);

    if (!hospital || !categoria) {
        const error = new Error(
            `A tabela ${ASSOCIATION_TABLE} já existe, mas não tem colunas reconhecidas para hospital e categoria. Colunas encontradas: ${colunas.join(", ") || "nenhuma"}.`
        );
        error.code = "ER_HAC_SCHEMA";
        throw error;
    }

    return { hospital, categoria };
}

export default function AtendimentoCategoria(app, db) {
    const router = Router();

    router.get("/atendimentoCategoria", async (req, res) => {
        try {
            const [rows] = await db.query("SELECT * FROM atendimento_categoria");
            return res.status(200).json(rows);
        } catch (error) {
            console.error("Erro ao consultar categorias:", error);
            return res.status(500).json({ error: "Erro na consulta ao banco" });
        }
    });

    router.post("/atendimentoCategoria", async (req, res) => {
        try {
            const nome = typeof req.body?.nome === "string" ? req.body.nome.trim() : "";
            if (!nome) {
                return res.status(400).json({ erro: "O campo nome é obrigatório." });
            }

            const [result] = await db.query(
                "INSERT INTO atendimento_categoria (nome) VALUES (?)",
                [nome]
            );
            return res.status(201).json({
                mensagem: "Atendimento cadastrado com sucesso",
                idAtendimento: result.insertId
            });
        } catch (error) {
            console.error("Erro ao inserir categoria:", error);
            return res.status(500).json({ error: "Erro ao inserir atendimento" });
        }
    });

    /**
     * @openapi
     * /hospitalAtendimentoCategoria:
     *   post:
     *     summary: Associar um hospital a uma categoria de atendimento
     *     description: Registra a relação usando os nomes de colunas reconhecidos na tabela existente. Requer token JWT.
     *     tags:
     *       - Hospitais
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [hospitalId, categoriaId]
     *             properties:
     *               hospitalId:
     *                 type: integer
     *                 example: 4
     *               categoriaId:
     *                 type: integer
     *                 example: 1
     *     responses:
     *       201:
     *         description: Associação cadastrada.
     *       400:
     *         description: IDs ausentes ou inválidos.
     *       401:
     *         description: Token não informado.
     *       403:
     *         description: Token inválido.
     *       404:
     *         description: Hospital ou categoria não encontrado.
     *       409:
     *         description: Essa associação já existe.
     *       500:
     *         description: Erro ao gravar a associação ou esquema incompatível.
     */
    router.post("/hospitalAtendimentoCategoria", autenticarToken, async (req, res) => {
        try {
            const hospitalId = Number(req.body?.hospitalId);
            const categoriaId = Number(req.body?.categoriaId);

            if (!Number.isSafeInteger(hospitalId) || hospitalId < 1 ||
                !Number.isSafeInteger(categoriaId) || categoriaId < 1) {
                return res.status(400).json({
                    erro: "Envie hospitalId e categoriaId como números inteiros positivos."
                });
            }

            const [hospitais] = await db.query(
                "SELECT id FROM hospital WHERE id = ? LIMIT 1",
                [hospitalId]
            );
            if (hospitais.length === 0) {
                return res.status(404).json({ erro: `Hospital ${hospitalId} não encontrado.` });
            }

            const [categorias] = await db.query("SELECT * FROM atendimento_categoria");
            const idFields = [
                "id_atendimento_categoria", "idAtendimento", "id_categoria",
                "id_categoria_atendimento", "atendimento_categoria_id", "id_atendimento", "id"
            ];
            const categoriaExiste = categorias.some((item) =>
                idFields.some((field) => item[field] !== undefined && item[field] !== null &&
                    Number(item[field]) === categoriaId)
            );
            if (!categoriaExiste) {
                return res.status(404).json({ erro: `Categoria ${categoriaId} não encontrada.` });
            }

            const { hospital: hospitalColuna, categoria: categoriaColuna } =
                await obterColunasAssociacao(db);
            const sql = `INSERT INTO ${ASSOCIATION_TABLE} (
                \`${hospitalColuna.replace(/`/g, "``")}\`,
                \`${categoriaColuna.replace(/`/g, "``")}\`
            ) VALUES (?, ?)`;
            await db.query(sql, [hospitalId, categoriaId]);

            return res.status(201).json({
                mensagem: "Hospital associado à categoria com sucesso.",
                hospitalId,
                categoriaId
            });
        } catch (error) {
            if (error?.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ erro: "Essa associação já existe." });
            }
            if (error?.code === "ER_HAC_SCHEMA") {
                console.error("Estrutura incompatível da tabela de associação:", error.message);
                return res.status(500).json({ erro: error.message });
            }
            console.error("Erro ao associar hospital e categoria:", error);
            return res.status(500).json({
                erro: "Não foi possível criar a associação. Confira a mensagem do terminal do backend."
            });
        }
    });

    app.use("/", router);
}
