import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import documentRoutes from './src/routes/documentRoutes.js';
import notificationRoutes from "./src/routes/notificationRoutes.js";
import personRoutes from './src/routes/personRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import userRoutes from './src/routes/userRoutes.js';



const server = express();
const PORT = process.env.PORT || 5000;


server.use(cors());
server.use(express.json());

server.use('/document', documentRoutes);
server.use('/notification', notificationRoutes);
server.use('/person', personRoutes);
server.use('/project', projectRoutes);
server.use('/user', userRoutes);



server.listen(PORT, () => {
    console.log("\n\n ╔════════════════════════════════╗");
    console.log(` ║ Servidor rodando na porta ${PORT} ║`);
    console.log(` ║     http://localhost:${PORT}/     ║`);
    console.log(" ╚════════════════════════════════╝\n\n");
});