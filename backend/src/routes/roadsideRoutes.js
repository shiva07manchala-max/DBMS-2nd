
const express = require('express');
const router = express.Router();
const {
  createRoadsideRequest,
  getRoadsideRequests,
  updateRoadsideStatus,
} = require('../controllers/roadsideController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getRoadsideRequests).post(createRoadsideRequest);
router.route('/:id/status').patch(authorize('advisor', 'admin'), updateRoadsideStatus);

module.exports = router;
