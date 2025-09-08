/*
* Ponto de entrada do aplicativo. Inicializa o aplicativo Express, aplica middlewares
* globais, registra rotas e inicia o servidor HTTP. Configuração
* Os valores são carregados de variáveis ​​de ambiente usando dotenv.
*/
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pino = require('pino');
const dotenv = require('dotenv');

// Carregar variáveis ​​de ambiente do arquivo .env se presentes
dotenv.config();

const { errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

// Cria uma instância do aplicativo Express
const app = express();

// Cria uma instância de logger
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Aplicar middleware de melhores práticas de segurança
app.use(helmet());
// Habilitar Cross-Origin Resource Sharing
app.use(cors({ origin: true, credentials: true }));
// Analisar corpo JSON
app.use(express.json());
// Anexar logger à solicitação
app.use((req, res, next) => {
  req.logger = logger;
  next();
});

// Registrar rotas de API sob o prefixo /api
app.use('/api', routes);

// Fallback para rotas inexistentes
app.use('*', (req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Rota não encontrada' });
});

// Manipulador de erros global
app.use(errorHandler);

// Iniciar o servidor
const port = process.env.PORT || 3333;
app.listen(port, () => {
  logger.info(`🚀 O servidor está rodando na porta ${port}`);
});

module.exports = app; // exportado para testes