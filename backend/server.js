import app from "./src/app.js";
import 'dotenv/config';

const port = 3000;

app.listen(port,() => {
    console.log("Servidor iniciado");
    console.log('Docs available on http://localhost:3000/api-docs');
});
