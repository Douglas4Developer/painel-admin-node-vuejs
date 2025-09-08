/*
* Camada de acesso a dados para tokens de atualização. Lida com armazenamento, revogação
* e validação de tokens de atualização. Os tokens de atualização são armazenados em hash
* usando bcrypt para segurança.
*/
const bcrypt = require('bcrypt');

const prisma = require('../infra/db');

async function create(userId, tokenHash, expiresAt) {
  return prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
}

async function findValid(userId, plainToken) {
// Busca todos os tokens não revogados e não expirados do usuário e compara
  const tokens = await prisma.refreshToken.findMany({
    where: {
      userId,
      revokedAt: null,
      expiresAt: { gt: new Date() }
    }
  });
  const validToken = await Promise.all(
    tokens.map(async (token) => {
      const match = await bcrypt.compare(plainToken, token.tokenHash);
      return match ? token : null;
    })
  );
  return validToken.find((token) => token !== null) || null;
}

async function revoke(id) {
  return prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
}

async function revokeUserTokens(userId) {
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

module.exports = {
  create,
  findValid,
  revoke,
  revokeUserTokens
};