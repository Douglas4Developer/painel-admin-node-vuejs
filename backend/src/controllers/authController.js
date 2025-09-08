/*
* Controlador de autenticação. Mapeia requisições HTTP para as chamadas de serviço
* correspondentes para login, atualização de token e logout.
*/

const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refresh_token: refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ code: 'INVALID_REQUEST', message: 'refresh_token is required' });
      return;
    }
    const tokens = await authService.refresh(refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refresh_token: refreshToken } = req.body;
    const userId = req.userId;
    await authService.logout(userId, refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: 'Conta criada com sucesso', data: user });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    // req.userId já vem do middleware authenticate (JWT)
    const user = await userRepository.findById(req.userId);
    if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND' });
    // responda só o necessário
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: (user.roles || []).map(ur => ({ id: ur.role.id, name: ur.role.name })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  refresh,
  logout,
  register,
  me,
};
