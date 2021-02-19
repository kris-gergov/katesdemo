const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updatePassword', authController.updatePassword);
router.patch('/updateAccount/:id', authController.updateAccount);
router.delete('/deleteAccount/:id', authController.deleteAccount);

router.get('/clients', userController.aliasClients, userController.getAllUsers);
router.get('/cleaners', userController.aliasCleaners, userController.getAllUsers);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getSingleUser);
router.post('/', userController.createUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
