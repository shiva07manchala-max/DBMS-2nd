
const express = require('express');
const router = express.Router();
const {
  getCustomerDashboardStats,
  getAdvisorAnalytics,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/dashboard', getCustomerDashboardStats);
router.get('/advisor', authorize('advisor', 'admin'), getAdvisorAnalytics);

module.exports = router;
