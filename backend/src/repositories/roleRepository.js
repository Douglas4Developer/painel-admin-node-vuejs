/*
* Camada de acesso a dados para funções. Lida com operações CRUD e
* consultas relacionais para a entidade Função.
*/
const prisma = require('../infra/db');

async function create(data) {
  return prisma.role.create({ data });
}

async function findById(id) {
  // valida e normaliza
  if (typeof id !== 'string' || !id.trim()) {
    const err = new Error('Role ID inválido');
    err.status = 400;
    err.code = 'ROLE_ID_INVALID';
    throw err;
  }
  return prisma.role.findUnique({ where: { id } });
}

async function findByName(name) {
  return prisma.role.findUnique({ where: { name } });
}

async function list() {
  return prisma.role.findMany({ orderBy: { createdAt: 'desc' } });
}

async function update(id, data) {
  return prisma.role.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.role.delete({ where: { id } });
}

async function countUsers(id) {
  return prisma.userRole.count({ where: { roleId: id } });
}

module.exports = {
  create,
  findById,
  findByName,
  list,
  update,
  remove,
  countUsers,
};
