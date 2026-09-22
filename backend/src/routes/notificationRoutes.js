
const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getNotifications);
router.route('/:id/read').patch(markAsRead);
router.route('/mark-all-read').post(markAllAsRead);

module.exports = router;
