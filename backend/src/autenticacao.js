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

    const token = partes[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = decoded;

        next();

    } catch (error) {
        console.error("Erro JWT:", error.name);

        return res.status(403).json({
            erro: "Token inválido"
        });
    }
}

// deve ser usado DEPOIS de autenticarToken O claim "admin" vem do JWT assinado no login entao o cliente nao consegue forjar
export function autenticarAdmin(req, res, next) {
    if (req.usuario?.admin !== true) {
        return res.status(403).json({
            erro: "Acesso restrito a administradores"
        });
    }

    next();
}
