const express = require('express');
const shiftController = require('../controllers/shiftController');
//const authController = require('../controllers/authController');

const router = express.Router();

//router.use(authController.protect);

router.get('/upcoming', shiftController.aliasUpcoming, shiftController.getAllShifts);
router.get('/past', shiftController.aliasPast, shiftController.getAllShifts);
router.get('/unpaid', shiftController.aliasUnpaid, shiftController.getAllShifts);
router.post('/summary', shiftController.getSummary);
router.get('/', shiftController.getAllShifts);
router.get('/:id', shiftController.getSingleShift);
router.post('/', shiftController.createShift);
router.patch('/:id', shiftController.updateShift);
router.delete('/:id', shiftController.deleteShift);

module.exports = router;
