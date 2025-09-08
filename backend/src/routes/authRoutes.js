/*
 * Routes for authentication. Login, refresh tokens and logout.
 */
const express = require('express');
const { loginRateLimiter } = require('../middlewares/rateLimiter');
const { authenticate } = require('../middlewares/authenticate');
const authController = require('../controllers/authController');

const router = express.Router();

// Registro público
router.post('/register', authController.register);
// Login com rate limit
router.post('/login', loginRateLimiter, authController.login);
// Refresh tokens
router.post('/refresh', authController.refresh);
// Logout precisa estar autenticado
router.post('/logout', authenticate, authController.logout);
// Dados do usuário autenticado
router.get('/me', authenticate, authController.me);

module.exports = router;
