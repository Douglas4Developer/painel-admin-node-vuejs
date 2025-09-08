/*
* Controlador para funções. Envolve o roleService para lidar com requisições HTTP.
* para gerenciar os cargos.
*/
const roleService = require('../services/roleService');

async function createRole(req, res, next) {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).json(role);
  } catch (err) {
    next(err);
  }
}

async function listRoles(req, res, next) {
  try {
    const roles = await roleService.listRoles();
    res.json({ data: roles });
  } catch (err) {
    next(err);
  }
}

async function getRole(req, res, next) {
  try {
    const role = await roleService.getRole(req.params.id);
    res.json(role);
  } catch (err) {
    next(err);
  }
}

async function updateRole(req, res, next) {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    res.json(role);
  } catch (err) {
    next(err);
  }
}

async function deleteRole(req, res, next) {
  try {
    await roleService.deleteRole(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRole,
  listRoles,
  getRole,
  updateRole,
  deleteRole
};