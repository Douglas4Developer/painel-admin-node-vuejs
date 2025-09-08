/*
* Camada de acesso a dados para usuários. Encapsula todas as consultas Prisma
* referentes à entidade Usuário e seus relacionamentos.
*/
const prisma = require('../infra/db');

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: { roles: { include: { role: true } } }
  });
}

async function create(userData, roleIds = []) {
  return prisma.user.create({
    data: {
      ...userData,
      roles: {
        create: roleIds.map((roleId) => ({ roleId }))
      }
    },
    include: { roles: { include: { role: true } } }
  });
}

async function update(id, data) {
  return prisma.user.update({ where: { id }, data });
}

async function setRoles(userId, roleIds) {
  const ids = (roleIds || []).filter(Boolean).map(String);
  return prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId } });
    return tx.user.update({
      where: { id: userId },
      data: { roles: { create: ids.map(roleId => ({ roleId })) } },
      include: { roles: { include: { role: true } } }
    });
  });
}


async function deactivate(id) {
  return prisma.user.update({ where: { id }, data: { isActive: false } });
}

async function changePassword(id, passwordHash) {
  return prisma.user.update({ where: { id }, data: { passwordHash } });
}

// Função auxiliar para construir o filtro "where" dinamicamente
function buildWhere({ q, roleId, status }) {
  const where = {};
  const s = (status ?? 'todos').toString().toLowerCase();
  const norm = ['ativo','active','true','1'].includes(s) ? 'active' :
    ['inativo','inactive','false','0'].includes(s) ? 'inactive' :
    'all';

  if (norm === 'active') where.isActive = true;
  else if (norm === 'inactive') where.isActive = false;

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (roleId) {
    // user.roles é a tabela de junção UserRole; o campo é roleId
    where.roles = { some: { roleId: String(roleId) } };
  }

  return where;
}

async function list({ roleId, q, skip, limit, status }) {
  const where = buildWhere({ q, roleId, status });

  return prisma.user.findMany({
    where,
    include: { roles: { include: { role: true } } },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });
}

async function count({ roleId, q, status }) {
  const where = buildWhere({ q, roleId, status });
  return prisma.user.count({ where });
}

module.exports = {
  findByEmail,
  findById,
  create,
  update,
  setRoles,
  deactivate,
  changePassword,
  list,
  count,
};
