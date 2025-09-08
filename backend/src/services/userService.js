/*
* Camada de serviço para gerenciamento de usuários. Aplica regras de negócios
* sobre os repositórios ao criar, atualizar e listar usuários.
*/
const { z } = require('zod');
const userRepository = require('../repositories/userRepository');
const roleRepository = require('../repositories/roleRepository');
const { hashPassword, comparePasswords } = require('../utils/password');

// Schemas de validação
const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  isActive: z.boolean().optional().default(true),
  roleIds: z.array(z.string().uuid()).optional()
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string().uuid()).optional() // agora aceita trocar roles
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

async function createUser(data) {
  const parsed = createUserSchema.parse(data);

  // Checa duplicidade de e-mail
  const existing = await userRepository.findByEmail(parsed.email);
  if (existing) {
    throw { status: 409, code: 'EMAIL_EXISTS', message: 'O e-mail já está em uso' };
  }

  const passwordHash = await hashPassword(parsed.password);

  const user = await userRepository.create(
    {
      name: parsed.name,
      email: parsed.email,
      passwordHash,
      isActive: parsed.isActive
    },
    parsed.roleIds || []
  );

  return {
    ...user,
    roles: (user.roles || []).map(ur => ur.role)
  };
}

async function updateUser(id, data) {
  const parsed = updateUserSchema.parse(data);

  // Checa duplicidade de e-mail
  if (parsed.email) {
    const existing = await userRepository.findByEmail(parsed.email);
    if (existing && existing.id !== id) {
      throw { status: 409, code: 'EMAIL_EXISTS', message: 'O e-mail já está em uso' };
    }
  }

  // Atualiza dados básicos
  const user = await userRepository.update(id, {
    name: parsed.name,
    email: parsed.email,
    isActive: parsed.isActive
  });

  // Se houver roleIds → atualiza cargos
  if (parsed.roleIds) {
    await userRepository.setRoles(id, parsed.roleIds);
  }

  const updated = await userRepository.findById(id);
  return {
    ...updated,
    roles: (updated.roles || []).map(ur => ur.role)
  };
}

async function deactivateUser(id) {
  return userRepository.deactivate(id);
}

async function changePassword(userId, data) {
  const parsed = changePasswordSchema.parse(data);
  const user = await userRepository.findById(userId);
  if (!user) {
    throw { status: 404, code: 'USER_NOT_FOUND', message: 'Usuário não encontrado' };
  }

  const passwordMatches = await comparePasswords(parsed.currentPassword, user.passwordHash);
  if (!passwordMatches) {
    throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'A senha atual está incorreta' };
  }

  const newHash = await hashPassword(parsed.newPassword);
  await userRepository.changePassword(userId, newHash);
}

async function setUserRoles(userId, roleIds) {
  const ids = (roleIds || []).map(String);

  for (const roleId of ids) {
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw { status: 404, code: 'ROLE_NOT_FOUND', message: `Cargo ${roleId} não encontrado` };
    }
  }

  await userRepository.setRoles(userId, ids);
  const user = await userRepository.findById(userId);

  return {
    ...user,
    roles: (user.roles || []).map(ur => ur.role)
  };
}

async function listUsers(query) {
  const {
    q,
    role_id: roleId,
    page = 1,
    limit = 10,
    status = 'todos'
  } = query;

  const pageNum = Number(page) || 1;
  const take = Math.min(Number(limit) || 10, 100);
  const skip = (pageNum - 1) * take;

  const [items, total] = await Promise.all([
    userRepository.list({
      roleId: roleId || undefined,
      q,
      skip,
      limit: take,
      status,
    }),
    userRepository.count({ roleId: roleId || undefined, q, status }),
  ]);

  const users = items.map(u => ({
    ...u,
    roles: (u.roles || []).map(ur => ur.role),
  }));

  return { items: users, meta: { total, page: pageNum, limit: take } };
}

async function getUser(id) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw { status: 404, code: 'USER_NOT_FOUND', message: 'Usuário não encontrado' };
  }
  return {
    ...user,
    roles: (user.roles || []).map(ur => ur.role)
  };
}

module.exports = {
  createUser,
  updateUser,
  deactivateUser,
  changePassword,
  setUserRoles,
  listUsers,
  getUser
};
