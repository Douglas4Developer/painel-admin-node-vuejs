/*
* Funções auxiliares do JWT. Responsáveis ​​por assinar e verificar tokens de acesso
* e atualização. Segredos e expirações são configurados por meio de
* variáveis de ambiente.
*/
const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'access-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

const DEFAULT_ACCESS_EXP = process.env.JWT_EXPIRES_IN || '60m'; //  requisito
const DEFAULT_REFRESH_EXP = process.env.JWT_REFRESH_EXPIRES_IN || '15d';

function generateAccessToken(payload, expiresIn = DEFAULT_ACCESS_EXP) {
  // garanta que quem chama passe { sub: user.id } no payload
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn });
}

function generateRefreshToken(payload, expiresIn = DEFAULT_REFRESH_EXP) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};