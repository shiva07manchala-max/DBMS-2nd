
const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getAppointments).post(createAppointment);
router.route('/:id').get(getAppointmentById);
router.route('/:id/status').patch(updateAppointmentStatus);

module.exports = router;
