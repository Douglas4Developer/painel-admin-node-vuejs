/*
* Controlador para CRUD do usuário e operações relacionadas. Delegado para
* userService para lógica de negócios.
*/
const { z } = require('zod');
const userService = require('../services/userService');

async function createUser(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const result = await userService.listUsers(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await userService.getUser(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function deactivateUser(req, res, next) {
  try {
    await userService.deactivateUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    await userService.changePassword(req.params.id, req.body);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function setUserRoles(req, res, next) {
  try {
    const bodySchema = z.object({
      roleIds: z.array(z.string()).optional(),
      role_ids: z.array(z.string()).optional(),
    });
    const parsed = bodySchema.parse(req.body);

    const raw = parsed.roleIds ?? parsed.role_ids ?? [];
    const ids = (Array.isArray(raw) ? raw : [])
      .filter(v => typeof v === 'string' && v.trim())
      .map(v => v.trim());

    const user = await userService.setUserRoles(req.params.id, ids);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deactivateUser,
  changePassword,
  setUserRoles
};