import { Router } from "express";
import autenticarToken, { autenticarAdmin } from "./autenticacao.js";

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

function numeroOpcional(value) {
    if (value === undefined || value === null || value === "") return null;
    return Number(value);
}

export default function Hospital(app, db) {
    const router = Router();

    /**
     * @openapi
     * /hospital:
     *   post:
     *     summary: Cadastrar hospital (somente administrador)
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
     *             required: [nome, endereco, latitude, longitude, altitude]
     *             properties:
     *               nome:
     *                 type: string
     *               endereco:
     *                 type: string
     *               latitude:
     *                 type: number
     *               longitude:
     *                 type: number
     *               altitude:
     *                 type: number
     *     responses:
     *       201:
     *         description: Hospital cadastrado.
     *       400:
     *         description: Dados inválidos.
     *       401:
     *         description: Token não informado.
     *       403:
     *         description: Token inválido ou usuário não é administrador.
     */
    router.post("/hospital", autenticarToken, autenticarAdmin, async (req, res) => {
        try {
            const { nome, endereco } = req.body ?? {};
            if (typeof nome !== "string" || !nome.trim()) {
                return res.status(400).json({ erro: "O campo nome é obrigatório." });
            }
            if (typeof endereco !== "string" || !endereco.trim()) {
                return res.status(400).json({ erro: "O campo endereco é obrigatório." });
            }

            const latitude = numeroOpcional(req.body?.latitude);
            const longitude = numeroOpcional(req.body?.longitude);
            const altitude = numeroOpcional(req.body?.altitude);

            if (latitude === null || longitude === null || altitude === null) {
                return res.status(400).json({
                    erro: "Latitude, longitude e altitude são obrigatórias."
                });
            }
            if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
                !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
                return res.status(400).json({
                    erro: "Informe latitude entre -90 e 90 e longitude entre -180 e 180."
                });
            }
            if (!Number.isFinite(altitude)) {
                return res.status(400).json({ erro: "A altitude deve ser um número." });
            }

            const sql = `
                INSERT INTO hospital (nome, endereco, altitude, longitude, latitude)
                VALUES (?, ?, ?, ?, ?)
            `;
            const [result] = await db.query(sql, [
                nome.trim(), endereco.trim(), altitude, longitude, latitude
            ]);
            return res.status(201).json({
                mensagem: "Hospital cadastrado com sucesso",
                idHospital: result.insertId
            });
        } catch (error) {
            console.error("Erro ao inserir hospital:", error);
            return res.status(500).json({ erro: "Erro ao inserir hospital" });
        }
    });

    /**
     * @openapi
     * /hospital/{id}:
     *   delete:
     *     summary: Excluir hospital (somente administrador)
     *     description: Remove o hospital junto com seus tempos registrados e associações com categorias.
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
     *     responses:
     *       200:
     *         description: Hospital excluído.
     *       400:
     *         description: ID inválido.
     *       401:
     *         description: Token não informado.
     *       403:
     *         description: Token inválido ou usuário não é administrador.
     *       404:
     *         description: Hospital não encontrado.
     */
    router.delete("/hospital/:id", autenticarToken, autenticarAdmin, async (req, res) => {
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({ erro: "O ID do hospital deve ser um inteiro positivo." });
        }

        let conn;
        try {
            conn = await db.getConnection();
            await conn.beginTransaction();

            const [existentes] = await conn.query(
                "SELECT id FROM hospital WHERE id = ? LIMIT 1 FOR UPDATE",
                [id]
            );
            if (existentes.length === 0) {
                await conn.rollback();
                return res.status(404).json({ erro: `Hospital ${id} não encontrado.` });
            }

            await conn.query("DELETE FROM registro_tempo_espera WHERE hospital_id = ?", [id]);

            try {
                const { hospital: hospitalColuna } = await obterColunasAssociacao(conn);
                await conn.query(
                    `DELETE FROM ${ASSOCIATION_TABLE} WHERE ${quoted(hospitalColuna)} = ?`,
                    [id]
                );
            } catch (error) {
                if (error?.code !== "ER_NO_SUCH_TABLE") throw error;
            }

            await conn.query("DELETE FROM hospital WHERE id = ?", [id]);
            await conn.commit();

            return res.status(200).json({
                mensagem: "Hospital excluído com sucesso.",
                hospitalId: id
            });
        } catch (error) {
            if (conn) {
                try { await conn.rollback(); } catch {}
            }
            console.error("Erro ao excluir hospital:", error);
            return res.status(500).json({ erro: "Não foi possível excluir o hospital." });
        } finally {
            conn?.release();
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

    // Lista hospitais com médias calculadas a partir dos tempos enviados pelo app.
    // Sem categoria: média geral do hospital. Com categoriaId: média daquele tipo.
    router.get("/hospital", async (req, res) => {
        try {
            const categoriaQuery = req.query.categoriaId;
            let categoriaId;

            if (categoriaQuery !== undefined) {
                const value = String(categoriaQuery);
                if (!/^\d+$/.test(value) || Number(value) < 1) {
                    return res.status(400).json({
                        erro: "O parâmetro categoriaId deve ser um ID numérico positivo."
                    });
                }
                categoriaId = Number(value);
            }

            let rows;
            if (categoriaId !== undefined) {
                const { hospital: hospitalColuna, categoria: categoriaColuna } =
                    await obterColunasAssociacao(db);
                const associationHospital = quoted(hospitalColuna);
                const associationCategory = quoted(categoriaColuna);

                [rows] = await db.query(`
                    SELECT
                        h.*,
                        (
                            SELECT ROUND(AVG(r.tempo_segundos))
                            FROM registro_tempo_espera r
                            WHERE r.hospital_id = h.id
                              AND r.categoria_id = ?
                        ) AS media_tempo_segundos,
                        (
                            SELECT COUNT(*)
                            FROM registro_tempo_espera r
                            WHERE r.hospital_id = h.id
                              AND r.categoria_id = ?
                        ) AS quantidade_registros
                    FROM hospital h
                    INNER JOIN ${ASSOCIATION_TABLE} hac
                        ON hac.${associationHospital} = h.id
                    WHERE hac.${associationCategory} = ?
                    ORDER BY h.nome ASC
                `, [categoriaId, categoriaId, categoriaId]);
            } else {
                [rows] = await db.query(`
                    SELECT
                        h.*,
                        (
                            SELECT ROUND(AVG(r.tempo_segundos))
                            FROM registro_tempo_espera r
                            WHERE r.hospital_id = h.id
                        ) AS media_tempo_segundos,
                        (
                            SELECT COUNT(*)
                            FROM registro_tempo_espera r
                            WHERE r.hospital_id = h.id
                        ) AS quantidade_registros
                    FROM hospital h
                    ORDER BY h.nome ASC
                `);
            }

            return res.status(200).json(rows);
        } catch (error) {
            console.error("Erro ao consultar hospitais e médias:", error);
            return res.status(500).json({
                erro: "Erro ao consultar hospitais. Confira se o script SQL de registro de tempos foi executado."
            });
        }
    });

    /**
     * Registra o tempo medido pelo usuário no cronômetro.
     * Requer autenticação para reduzir registros anônimos/falsos.
     */
    router.post("/tempos-espera", autenticarToken, async (req, res) => {
        try {
            const hospitalId = Number(req.body?.hospitalId);
            const tempoSegundos = Number(req.body?.tempoSegundos);
            const categoriaRaw = req.body?.categoriaId;
            const categoriaId =
                categoriaRaw === undefined || categoriaRaw === null || categoriaRaw === ""
                    ? null
                    : Number(categoriaRaw);

            if (!Number.isSafeInteger(hospitalId) || hospitalId < 1) {
                return res.status(400).json({ erro: "hospitalId deve ser um inteiro positivo." });
            }
            if (!Number.isSafeInteger(tempoSegundos) || tempoSegundos < 1 || tempoSegundos > 86400) {
                return res.status(400).json({
                    erro: "tempoSegundos deve ser um inteiro entre 1 e 86400 segundos."
                });
            }
            if (categoriaId !== null &&
                (!Number.isSafeInteger(categoriaId) || categoriaId < 1)) {
                return res.status(400).json({
                    erro: "categoriaId deve ser um inteiro positivo ou nulo."
                });
            }

            const [hospitais] = await db.query(
                "SELECT id FROM hospital WHERE id = ? LIMIT 1",
                [hospitalId]
            );
            if (hospitais.length === 0) {
                return res.status(404).json({ erro: "Hospital não encontrado." });
            }

            if (categoriaId !== null) {
                const [categorias] = await db.query(
                    "SELECT * FROM atendimento_categoria"
                );
                const idFields = [
                    "id_atendimento_categoria", "idAtendimento", "id_categoria",
                    "id_categoria_atendimento", "atendimento_categoria_id", "id_atendimento", "id"
                ];
                const existe = categorias.some((item) =>
                    idFields.some((field) =>
                        item[field] !== undefined &&
                        item[field] !== null &&
                        Number(item[field]) === categoriaId
                    )
                );
                if (!existe) {
                    return res.status(404).json({ erro: "Categoria de atendimento não encontrada." });
                }
            }

            const [result] = await db.query(
                `INSERT INTO registro_tempo_espera
                    (hospital_id, categoria_id, tempo_segundos, usuario_id)
                 VALUES (?, ?, ?, ?)`,
                [hospitalId, categoriaId, tempoSegundos, req.usuario?.id ?? null]
            );

            return res.status(201).json({
                mensagem: "Tempo registrado com sucesso.",
                idRegistro: result.insertId,
                hospitalId,
                categoriaId,
                tempoSegundos
            });
        } catch (error) {
            console.error("Erro ao salvar tempo de espera:", error);
            return res.status(500).json({
                erro: "Não foi possível salvar o tempo. Confira se o script SQL de registro de tempos foi executado."
            });
        }
    });

    app.use("/", router);
}
