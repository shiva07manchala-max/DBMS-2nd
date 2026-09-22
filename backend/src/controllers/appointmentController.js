const Appointment = require('../models/Appointment');
const Vehicle = require('../models/Vehicle');
const ServiceCenter = require('../models/ServiceCenter');
const Notification = require('../models/Notification');

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    const filter = req.user.role === 'customer'
      ? { user: req.user.id }
      : {};

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.vehicleId) {
      filter.vehicle = req.query.vehicleId;
    }

    const appointments = await Appointment.find(filter)
      .populate('vehicle', 'make model year plateNumber')
      .populate('user', 'name email phone')
      .populate('serviceCenter', 'name address phone city')
      .sort({ scheduledDate: -1 });

    res.status(200).json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('vehicle')
      .populate('user', 'name email phone')
      .populate('serviceCenter');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user.role === 'customer' && appointment.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a new service appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res, next) => {
  try {
    const {
      vehicleId,
      serviceCenterId,
      serviceType,
      scheduledDate,
      timeSlot,
      pickupDropRequired,
      pickupAddress,
      customerNotes,
      estimatedCost,
    } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Selected vehicle not found' });
    }

    // Default to first service center if not provided
    let centerId = serviceCenterId;
    if (!centerId) {
      const defaultCenter = await ServiceCenter.findOne();
      if (defaultCenter) {
        centerId = defaultCenter._id;
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `DC-${new Date().getFullYear()}-${randomSuffix}`;

    const appointment = await Appointment.create({
      bookingId,
      user: req.user.id,
      vehicle: vehicleId,
      serviceCenter: centerId,
      serviceType: serviceType || 'Periodic Maintenance',
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      pickupDropRequired: !!pickupDropRequired,
      pickupAddress: pickupAddress || '',
      estimatedCost: estimatedCost || 1999,
      customerNotes: customerNotes || '',
      status: 'Confirmed', // Instant auto-confirmation for self-service convenience
    });

    // Create a real-time notification
    await Notification.create({
      user: req.user.id,
      title: 'Appointment Confirmed! 🚗',
      message: `Your booking #${bookingId} for ${serviceType} on ${new Date(scheduledDate).toLocaleDateString()} at ${timeSlot} is confirmed.`,
      type: 'booking_status',
      link: '/bookings',
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('vehicle', 'make model year plateNumber')
      .populate('serviceCenter', 'name address phone');

    res.status(201).json({ success: true, appointment: populatedAppointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Advisor or Customer cancel)
// @route   PATCH /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, advisorNotes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Customers can only cancel their own booking
    if (req.user.role === 'customer') {
      if (appointment.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      if (status !== 'Cancelled') {
        return res.status(400).json({ success: false, message: 'Customers can only cancel bookings' });
      }
    }

    appointment.status = status;
    if (advisorNotes) appointment.advisorNotes = advisorNotes;
    if (status === 'Completed') appointment.completedAt = new Date();

    await appointment.save();

    // Notify customer
    await Notification.create({
      user: appointment.user,
      title: `Booking #${appointment.bookingId} Update`,
      message: `Your appointment status is now updated to: ${status}.`,
      type: 'booking_status',
      link: '/bookings',
    });

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};
