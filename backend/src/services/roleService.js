/*
* Camada de serviço para os cargos. Implementa regras de negócios para criar,
* atualizar, listar e excluir cargos. Impede a exclusão quando
* os cargos estão em uso pelos usuários.
*/
const { z } = require('zod');
const roleRepository = require('../repositories/roleRepository');

const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

const updateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional()
});

async function createRole(data) {
  const parsed = createRoleSchema.parse(data);
  // Ensure name is unique
  const exists = await roleRepository.findByName(parsed.name);
  if (exists) {
    throw { status: 409, code: 'ROLE_EXISTS', message: 'Nome do cargo já existe' };
  }
  return roleRepository.create(parsed);
}

async function updateRole(id, data) {
  const parsed = updateRoleSchema.parse(data);
  if (parsed.name) {
    const exists = await roleRepository.findByName(parsed.name);
    if (exists && exists.id !== id) {
      throw { status: 409, code: 'ROLE_EXISTS', message: 'Nome do cargo já existe' };
    }
  }
  return roleRepository.update(id, parsed);
}

async function deleteRole(id) {
  // Do not allow deletion if any user has this role
  const count = await roleRepository.countUsers(id);
  if (count > 0) {
    throw { status: 409, code: 'ROLE_IN_USE', message: 'Cargo está atribuído a usuários; desatribua antes da exclusão' };
  }
  return roleRepository.remove(id);
}

async function listRoles() {
  return roleRepository.list();
}

async function getRole(id) {
  const role = await roleRepository.findById(id);
  if (!role) {
    throw { status: 404, code: 'ROLE_NOT_FOUND', message: 'Cargo não encontrado' };
  }
  return role;
}

module.exports = {
  createRole,
  updateRole,
  deleteRole,
  listRoles,
  getRole,
};