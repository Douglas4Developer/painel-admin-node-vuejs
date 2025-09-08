/*
* Middleware para autenticar requisições usando o token de acesso. O
* cabeçalho de autorização deve ser fornecido no formato "Bearer <token>".
* Em caso de sucesso, req.userId é definido como o ID codificado no token.
*/
const { verifyAccessToken } = require('../infra/jwt');

function authenticate(req, res, next) {
  const authHeader = `${req.headers.authorization || ''}`.trim();
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.sub || decoded.userId || decoded.id;
    req.userPayload = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }
}
module.exports = { authenticate };
