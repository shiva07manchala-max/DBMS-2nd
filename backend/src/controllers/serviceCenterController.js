const ServiceCenter = require('../models/ServiceCenter');

// @desc    Get all authorized service centers
// @route   GET /api/service-centers
// @access  Public
exports.getServiceCenters = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = {};

    if (city) {
      query.city = new RegExp(city, 'i');
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
      ];
    }

    const centers = await ServiceCenter.find(query).sort({ rating: -1 });
    res.status(200).json({ success: true, count: centers.length, centers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service center
// @route   GET /api/service-centers/:id
// @access  Public
exports.getServiceCenterById = async (req, res, next) => {
  try {
    const center = await ServiceCenter.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ success: false, message: 'Service center not found' });
    }
    res.status(200).json({ success: true, center });
  } catch (error) {
    next(error);
  }
};
