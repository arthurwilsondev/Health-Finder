import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export default function Login(app, db) {

    /**
     * @openapi
     * /login:
     *   post:
     *     summary: Autenticação de usuário
     *     description: Valida usuário e senha e retorna um token JWT e o indicador de administrador.
     *     tags:
     *       - Autenticação
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - senha
     *             properties:
     *               email:
     *                 type: string
     *                 example: "email"
     *               senha:
     *                 type: string
     *                 example: "senha"
     *     responses:
     *       200:
     *         description: Login realizado com sucesso.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *                 admin:
     *                   type: boolean
     *                   example: false
     *       401:
     *         description: Usuário ou senha inválidos.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 erro:
     *                   type: string
     *                   example: "Usuário ou senha inválidos"
     *       500:
     *         description: Erro interno do servidor.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 erro:
     *                   type: string
     *                   example: "Erro interno do servidor"
     */
  app.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: "E-mail e senha são obrigatórios"
            });
        }

        const [usuarios] = await db.execute(
            "SELECT * FROM usuario WHERE email = ?",
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: "E-mail ou senha inválidos"
            });
        }

        const usuario = usuarios[0];

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaValida) {
            return res.status(401).json({
                mensagem: "E-mail ou senha inválidos"
            });
        }

        const admin = Number(usuario.admin) === 1;

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                admin
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );


        return res.json({
            mensagem: "Login realizado com sucesso",
            token,
            admin
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensagem: "Erro interno do servidor"
        });
    }
  });
}
