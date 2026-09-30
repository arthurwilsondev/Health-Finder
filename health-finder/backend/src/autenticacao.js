import jwt from "jsonwebtoken";

export default function autenticarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            erro: "Token não informado"
        });
    }

    const partes = authHeader.split(" ");

    if (
        partes.length !== 2 ||
        partes[0] !== "Bearer"
    ) {
        return res.status(401).json({
            erro: "Formato do token inválido"
        });
    }
    console.log("SECRET NA AUTENTICACAO:", process.env.JWT_SECRET);

    const token = partes[1];
    console.log("TOKEN RECEBIDO:", token);

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = decoded;

        next();

    } catch (error) {
        console.error("Erro JWT:", error.name);
        console.error("Mensagem:", error.message);

        return res.status(403).json({
            erro: "Token inválido"
        });
    }
}