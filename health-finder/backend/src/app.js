import express from "express";
import mysql from "mysql2/promise";
import 'dotenv/config';
import OpenAI from "openai";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import jwt from "jsonwebtoken";
import cors from 'cors';


import Login from "./login.js";
import Usuario from "./usuario.js"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]

  },
  apis: ['./src/*.js']
};


const specs = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password:  process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


Login(app, db);
Usuario(app,db);

/**
 * @openapi
 * /:
 *   get:
 *     summary: Página inicial da API
 *     description: Retorna uma mensagem indicando que a API está em funcionamento.
 *     tags:
 *       - Teste da API
 *     responses:
 *       200:
 *         description: Mensagem de sucesso.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Curso de DM Fundatec
 */
app.get("/",(req,res) => {
  res.status(200).send("Curso DM Fundatec");
});



export default app;