/*
* Funções utilitárias para hash e verificação de senhas usando bcrypt.
*/
const bcrypt = require('bcrypt');

/**
 * Cria hash de uma senha em texto simples.
 *
 * @param {string} password Senha simples
 * @returns {Promise<string>} Senha com hash
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Compara uma senha simples com sua contraparte com hash.
 *
 * @param {string} password Senha simples
 * @param {string} hash Senha com hash
 * @returns {Promise<boolean>} Verdadeiro se as senhas corresponderem
 */
async function comparePasswords(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { hashPassword, comparePasswords };