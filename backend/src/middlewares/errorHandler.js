/*
* Middleware para tratamento de erros. Captura quaisquer erros gerados durante o
* processamento da solicitação
* e retorna uma resposta JSON padronizada. Registra os erros
* usando Pino, se disponível em req.logger.
*/
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const logger = req.logger || console;
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error';
  const details = err.details || null;

  logger.error({ err, code, details }, message);

  res.status(status).json({ code, message, details });
}

module.exports = { errorHandler };
