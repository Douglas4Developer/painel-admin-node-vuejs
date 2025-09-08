/*
 * Authentication service. Encapsulates business logic around
 * authentication including login, refreshing tokens and logout.
 */
const bcrypt = require('bcrypt');
const { z } = require('zod');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../infra/jwt');
const userRepository = require('../repositories/userRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const { comparePasswords } = require('../utils/password');
const roleRepository = require('../repositories/roleRepository');
const { hashPassword } = require('../utils/password');

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

async function login(email, password) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error('E-mail ou senha inválidos');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }
  if (!user.isActive) {
    const error = new Error('A conta do usuário está Inativa. Contate o administrador.');
    error.status = 403;
    error.code = 'USER_INACTIVE';
    throw error;
  }
  const passwordMatches = await comparePasswords(password, user.passwordHash);
  if (!passwordMatches) {
    const error = new Error('A conta do usuário está desativada. Contate o administrador.');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }
  // Generate tokens
  const payload = { sub: user.id };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  // Store hashed refresh token
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  await refreshTokenRepository.create(user.id, tokenHash, expiresAt);
  return { accessToken, refreshToken };
}

async function refresh(oldRefreshToken) {
  // Verificar assinatura e expiração
  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch (err) {
    const error = new Error('Token de atualização inválido ou expirado');
    error.status = 401;
    error.code = 'INVALID_TOKEN';
    throw error;
  }
  const userId = decoded.sub || decoded.userId || decoded.id;
  // Verifique se o hash do token existe e não foi revogado/expirado
  const stored = await refreshTokenRepository.findValid(userId, oldRefreshToken);
  if (!stored) {
    // Se o token não for encontrado, negação imediata
    await refreshTokenRepository.revokeUserTokens(userId);
    const error = new Error('Token de atualização revogado ou inválido');
    error.status = 401;
    error.code = 'TOKEN_REVOKED';
    throw error;
  }
  // Rotacionar: revogar token antigo e emitir novo
  await refreshTokenRepository.revoke(stored.id);
  const payload = { sub: userId };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);
  const newHash = await bcrypt.hash(newRefreshToken, 10);
  const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  await refreshTokenRepository.create(userId, newHash, expiresAt);
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function logout(userId, refreshToken) {
  try {
    verifyRefreshToken(refreshToken);
    const stored = await refreshTokenRepository.findValid(userId, refreshToken);
    if (stored) {
      await refreshTokenRepository.revoke(stored.id);
    }
  } catch (err) {
  // ignorar tokens inválidos no logout
  }
  // Também revogar todos os tokens do usuário no logout
  await refreshTokenRepository.revokeUserTokens(userId);
}

async function register(data) {
  const payload = registerSchema.parse(data);

  // e-mail único
  const exists = await userRepository.findByEmail(payload.email);
  if (exists) {
    const err = new Error('E-mail já cadastrado');
    err.status = 409;
    err.code = 'EMAIL_TAKEN';
    throw err;
  }

  // cria usuário básico ativo
  const passwordHash = await hashPassword(payload.password);
  let user = await userRepository.create({
    name: payload.name,
    email: payload.email,
    passwordHash,
    isActive: true,
  });

  // garante role 'user'
  let userRole = await roleRepository.findByName('user');
  if (!userRole) userRole = await roleRepository.create({ name: 'user', description: 'Usuário padrão' });

  await userRepository.setRoles(user.id, [userRole.id]);
  user = await userRepository.findById(user.id);

  // opcional: já retornar tokens. Aqui vou só confirmar criação.
  return { id: user.id, email: user.email, name: user.name };
}

module.exports = {
  login,
  refresh,
  logout,
  register,
};
