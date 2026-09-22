
const express = require('express');
const router = express.Router();
const {
  getServiceCenters,
  getServiceCenterById,
} = require('../controllers/serviceCenterController');

router.route('/').get(getServiceCenters);
router.route('/:id').get(getServiceCenterById);

module.exports = router;
