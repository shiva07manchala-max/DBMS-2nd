
const express = require('express');
const router = express.Router();
const {
  getServiceRecords,
  getServiceRecordById,
  createServiceRecord,
  payInvoice,
} = require('../controllers/serviceRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getServiceRecords);
router.post('/', authorize('advisor', 'admin'), createServiceRecord);
router.route('/:id').get(getServiceRecordById);
router.route('/:id/pay').post(payInvoice);

module.exports = router;
