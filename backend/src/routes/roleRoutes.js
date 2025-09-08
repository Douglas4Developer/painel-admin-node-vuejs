/*
 * Role routes. Protected by authentication. Administrative actions
 * such as deletion require the 'admin' role.
 */
const express = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const roleController = require('../controllers/roleController');

const router = express.Router();

// Apply authentication to all role routes
router.use(authenticate);

router.post('/', authorize(['admin']), roleController.createRole);
router.get('/', roleController.listRoles);
router.get('/:id', roleController.getRole);
router.put('/:id', authorize(['admin']), roleController.updateRole);
router.delete('/:id', authorize(['admin']), roleController.deleteRole);

module.exports = router;