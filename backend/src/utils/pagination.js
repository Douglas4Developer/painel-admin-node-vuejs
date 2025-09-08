/*
* Função auxiliar para calcular parâmetros de paginação. Aceita parâmetros de consulta de página e
* limite e retorna os valores de skip e take de base zero
* usados ​​pelo Prisma. O padrão é página 1 e o limite é 10.
*/
function getPaginationParams(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(query.limit, 10) || 10, 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

module.exports = { getPaginationParams };