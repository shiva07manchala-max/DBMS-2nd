
const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getVehicles).post(addVehicle);
router.route('/:id').get(getVehicleById).put(updateVehicle).delete(deleteVehicle);

module.exports = router;
