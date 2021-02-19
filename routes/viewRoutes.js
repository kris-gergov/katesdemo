const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/login', viewController.login);

router.use(authController.isLoggedIn);

router.get('/', authController.protect, viewController.home);

router.get('/add_shift', authController.protect, authController.restrictTo('admin'), viewController.addShift);

router.get('/edit_shift/:id', viewController.editShift);

router.get('/add_cleaner', authController.protect, authController.restrictTo('admin'), viewController.roleType('cleaner'), viewController.addUser);

router.get('/add_client', authController.protect, authController.restrictTo('admin'), viewController.roleType('client'), viewController.addUser);

router.get('/upcoming_shifts', authController.protect, viewController.upcomingShifts);

router.get('/past_shifts', authController.protect, viewController.pastShifts);

router.get('/unpaid_shifts', authController.protect, viewController.unpaidShifts);

router.get('/shifts', authController.protect, viewController.getShifts);

router.get('/shifts/:id', authController.protect, viewController.getShift);

router.get('/cleaners', authController.protect, viewController.getCleaners);

router.get('/clients', authController.protect, viewController.getClients);

router.get('/profile', authController.protect, viewController.getUser);

router.get('/profile/:id', authController.protect, viewController.getUser);

router.get('/edit_user/:id', authController.protect, viewController.editUser);

router.get('/summary', authController.protect, viewController.summary);

module.exports = router;
