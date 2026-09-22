const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    serviceCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCenter',
      required: true,
    },
    serviceType: {
      type: String,
      required: [true, 'Please select service type'],
      enum: [
        'Periodic Maintenance',
        'Oil & Filter Change',
        'Tyre & Wheel Care',
        'Brake Inspection & Repair',
        'AC Service & Disinfection',
        'Battery Health & Care',
        'Full Vehicle 40-Point Inspection',
        'Engine Diagnostics',
        'Custom Repair',
      ],
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Please select appointment date'],
      index: true,
    },
    timeSlot: {
      type: String,
      required: [true, 'Please select time slot'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    pickupDropRequired: {
      type: Boolean,
      default: false,
    },
    pickupAddress: {
      type: String,
      default: '',
    },
    estimatedCost: {
      type: Number,
      default: 1999,
    },
    customerNotes: {
      type: String,
      default: '',
    },
    advisorNotes: {
      type: String,
      default: '',
    },
    assignedAdvisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
