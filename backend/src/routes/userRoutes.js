/*
 * User routes. Protected by authentication middleware. Supports CRUD,
 * deactivation, password change and role assignment. Lists users
 * with optional filters.
 */
const express = require('express');
const { authenticate } = require('../middlewares/authenticate');
const userController = require('../controllers/userController');

const router = express.Router();

// Apply authentication to all user routes
router.use(authenticate);

router.post('/', userController.createUser);
router.get('/', userController.listUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.patch('/:id/deactivate', userController.deactivateUser);
router.patch('/:id/password', userController.changePassword);
router.post('/:id/roles', userController.setUserRoles);
router.put('/:id/roles', userController.setUserRoles);

module.exports = router;
