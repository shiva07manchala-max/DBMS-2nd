const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Appointment = require('../models/Appointment');
const ServiceRecord = require('../models/ServiceRecord');
const RoadsideRequest = require('../models/RoadsideRequest');

// @desc    Get aggregated dashboard stats for Customer
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getCustomerDashboardStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Vehicles count and average health score
    const vehicleStats = await Vehicle.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: null,
          totalVehicles: { $sum: 1 },
          avgHealthScore: { $avg: '$healthScore' },
          totalMileage: { $sum: '$mileage' },
        },
      },
    ]);

    // 2. Upcoming appointments count
    const upcomingBookingsCount = await Appointment.countDocuments({
      user: userId,
      status: { $in: ['Pending', 'Confirmed', 'In-Progress'] },
    });

    // 3. Service Record financial aggregation (Total Spent, Paid vs Pending)
    const financialStats = await ServiceRecord.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$paymentStatus',
          totalAmount: { $sum: '$grandTotal' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalSpent = 0;
    let pendingDue = 0;
    financialStats.forEach((stat) => {
      if (stat._id === 'Paid') totalSpent += stat.totalAmount;
      if (stat._id === 'Pending') pendingDue += stat.totalAmount;
    });

    // 4. Open roadside SOS count
    const openRoadsideCount = await RoadsideRequest.countDocuments({
      user: userId,
      status: { $in: ['Requested', 'Assigned', 'Dispatched', 'Arrived'] },
    });

    // 5. Recent upcoming appointment
    const nextAppointment = await Appointment.findOne({
      user: userId,
      status: { $in: ['Pending', 'Confirmed', 'In-Progress'] },
    })
      .populate('vehicle', 'make model plateNumber')
      .populate('serviceCenter', 'name')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      stats: {
        totalVehicles: vehicleStats[0] ? vehicleStats[0].totalVehicles : 0,
        avgHealthScore: vehicleStats[0] ? Math.round(vehicleStats[0].avgHealthScore) : 100,
        upcomingBookings: upcomingBookingsCount,
        totalSpent,
        pendingDue,
        openRoadsideRequests: openRoadsideCount,
        loyaltyPoints: req.user.loyaltyPoints || 500,
        nextAppointment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated Workshop & DBMS analytics for Service Advisor / Admin
// @route   GET /api/analytics/advisor
// @access  Private (Advisor/Admin)
exports.getAdvisorAnalytics = async (req, res, next) => {
  try {
    // 1. Appointments distribution by status
    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // 2. Revenue aggregation by service type
    const revenueByService = await ServiceRecord.aggregate([
      {
        $group: {
          _id: '$serviceType',
          totalRevenue: { $sum: '$grandTotal' },
          totalServices: { $sum: 1 },
          avgTicketSize: { $avg: '$grandTotal' },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // 3. Roadside assistance breakdown
    const roadsideBreakdown = await RoadsideRequest.aggregate([
      {
        $group: {
          _id: '$emergencyType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 4. Overall counts
    const totalVehiclesCount = await Vehicle.countDocuments();
    const totalAppointmentsCount = await Appointment.countDocuments();
    const totalInvoicesCount = await ServiceRecord.countDocuments();
    const totalRevenueSum = await ServiceRecord.aggregate([
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        totalVehicles: totalVehiclesCount,
        totalAppointments: totalAppointmentsCount,
        totalInvoices: totalInvoicesCount,
        grossRevenue: totalRevenueSum[0] ? totalRevenueSum[0].total : 0,
        appointmentsByStatus,
        revenueByService,
        roadsideBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};
