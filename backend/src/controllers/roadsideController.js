const RoadsideRequest = require('../models/RoadsideRequest');
const Vehicle = require('../models/Vehicle');
const ServiceCenter = require('../models/ServiceCenter');
const Notification = require('../models/Notification');

// @desc    Request Emergency Roadside Assistance (SOS)
// @route   POST /api/roadside
// @access  Private
exports.createRoadsideRequest = async (req, res, next) => {
  try {
    const {
      vehicleId,
      emergencyType,
      contactPhone,
      address,
      latitude,
      longitude,
      urgency,
      notes,
    } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const defaultCenter = await ServiceCenter.findOne();
    const requestId = `SOS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const roadside = await RoadsideRequest.create({
      requestId,
      user: req.user.id,
      vehicle: vehicleId,
      emergencyType: emergencyType || 'Towing Assistance',
      urgency: urgency || 'High',
      contactPhone: contactPhone || req.user.phone || '+91 98765 43210',
      location: {
        address: address || 'Current GPS Location (Highway NH44, Hyderabad)',
        latitude: latitude || 17.4485,
        longitude: longitude || 78.3748,
      },
      serviceCenterAssigned: defaultCenter ? defaultCenter._id : null,
      status: 'Assigned',
      mechanicAssigned: {
        name: 'Rapid Response Unit 04 (Venkatesh R.)',
        phone: '+91 94401 22334',
        etaMinutes: 18,
        vanPlate: 'TS 09 SOS 4412',
      },
      notes: notes || '',
    });

    // Notify user
    await Notification.create({
      user: req.user.id,
      title: '🆘 Roadside Rescue Dispatched!',
      message: `Help is on the way for your ${vehicle.make} ${vehicle.model}. ETA: 18 mins. Driver: Venkatesh R. (+91 94401 22334)`,
      type: 'roadside_update',
      link: '/roadside',
    });

    const populated = await RoadsideRequest.findById(roadside._id)
      .populate('vehicle', 'make model plateNumber color')
      .populate('serviceCenterAssigned', 'name phone address');

    res.status(201).json({ success: true, roadside: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get roadside assistance requests
// @route   GET /api/roadside
// @access  Private
exports.getRoadsideRequests = async (req, res, next) => {
  try {
    const filter = req.user.role === 'customer'
      ? { user: req.user.id }
      : {};

    const requests = await RoadsideRequest.find(filter)
      .populate('vehicle', 'make model plateNumber color year')
      .populate('user', 'name email phone')
      .populate('serviceCenterAssigned', 'name phone address')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Update roadside request status (Advisor / Dispatcher)
// @route   PATCH /api/roadside/:id/status
// @access  Private
exports.updateRoadsideStatus = async (req, res, next) => {
  try {
    const { status, etaMinutes, mechanicName, mechanicPhone } = req.body;
    const request = await RoadsideRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Roadside request not found' });
    }

    if (status) request.status = status;
    if (etaMinutes !== undefined) request.mechanicAssigned.etaMinutes = etaMinutes;
    if (mechanicName) request.mechanicAssigned.name = mechanicName;
    if (mechanicPhone) request.mechanicAssigned.phone = mechanicPhone;
    if (status === 'Resolved') request.resolvedAt = new Date();

    await request.save();

    await Notification.create({
      user: request.user,
      title: `SOS Request Status: ${status}`,
      message: `Your roadside assistance status is updated to ${status}.`,
      type: 'roadside_update',
      link: '/roadside',
    });

    res.status(200).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};
