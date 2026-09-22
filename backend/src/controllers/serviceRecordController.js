const ServiceRecord = require('../models/ServiceRecord');
const Vehicle = require('../models/Vehicle');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// @desc    Get all service records
// @route   GET /api/service-records
// @access  Private
exports.getServiceRecords = async (req, res, next) => {
  try {
    const filter = req.user.role === 'customer'
      ? { user: req.user.id }
      : {};

    if (req.query.vehicleId) {
      filter.vehicle = req.query.vehicleId;
    }

    const records = await ServiceRecord.find(filter)
      .populate('vehicle', 'make model year plateNumber')
      .populate('user', 'name email phone')
      .populate('serviceCenter', 'name address phone city')
      .sort({ serviceDate: -1 });

    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service record / invoice
// @route   GET /api/service-records/:id
// @access  Private
exports.getServiceRecordById = async (req, res, next) => {
  try {
    const record = await ServiceRecord.findById(req.params.id)
      .populate('vehicle')
      .populate('user', 'name email phone address')
      .populate('serviceCenter');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Service record not found' });
    }

    if (req.user.role === 'customer' && record.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this record' });
    }

    res.status(200).json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service record & invoice (Advisor only)
// @route   POST /api/service-records
// @access  Private (Advisor)
exports.createServiceRecord = async (req, res, next) => {
  try {
    const {
      vehicleId,
      userId,
      appointmentId,
      serviceCenterId,
      mileageAtService,
      serviceType,
      workSummary,
      items,
      paymentMethod,
      technicianName,
    } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const calculatedTotal = (items || []).reduce((acc, item) => acc + (Number(item.cost) || 0), 0);
    const taxAmount = Math.round(calculatedTotal * 0.18); // 18% GST
    const grandTotal = calculatedTotal + taxAmount;

    const recordId = `SR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const record = await ServiceRecord.create({
      recordId,
      user: userId || vehicle.owner,
      vehicle: vehicleId,
      appointment: appointmentId || null,
      serviceCenter: serviceCenterId,
      serviceDate: new Date(),
      mileageAtService: mileageAtService || vehicle.mileage,
      serviceType: serviceType || 'Comprehensive Service',
      workSummary,
      items: items || [],
      grandTotal,
      taxAmount,
      totalLabor: calculatedTotal,
      paymentStatus: 'Paid',
      paymentMethod: paymentMethod || 'Online / UPI',
      invoiceNumber,
      invoiceDate: new Date(),
      technicianName: technicianName || 'Master Tech Rajesh K.',
    });

    // Update vehicle's last service date and mileage
    vehicle.lastServiceDate = new Date();
    if (mileageAtService && mileageAtService > vehicle.mileage) {
      vehicle.mileage = mileageAtService;
    }
    vehicle.healthScore = 95; // reset health after service
    await vehicle.save();

    // If linked to appointment, mark appointment completed
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'Completed', completedAt: new Date() });
    }

    // Send notification
    await Notification.create({
      user: vehicle.owner,
      title: `Invoice Generated: ${invoiceNumber} 🧾`,
      message: `Your service record for ${vehicle.make} ${vehicle.model} has been finalized. Total: ₹${grandTotal.toLocaleString()}.`,
      type: 'service_reminder',
      link: '/records',
    });

    res.status(201).json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate instant online invoice payment
// @route   POST /api/service-records/:id/pay
// @access  Private
exports.payInvoice = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    const record = await ServiceRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    record.paymentStatus = 'Paid';
    record.paymentMethod = paymentMethod || 'Online / UPI';
    await record.save();

    await Notification.create({
      user: record.user,
      title: `Payment Successful! 💳`,
      message: `Payment of ₹${record.grandTotal.toLocaleString()} for Invoice ${record.invoiceNumber} received successfully.`,
      type: 'system',
      link: '/records',
    });

    res.status(200).json({ success: true, message: 'Invoice paid successfully', record });
  } catch (error) {
    next(error);
  }
};
