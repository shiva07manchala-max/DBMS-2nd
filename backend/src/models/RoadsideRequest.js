const mongoose = require('mongoose');

const roadsideRequestSchema = new mongoose.Schema(
  {
    requestId: {
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
    },
    emergencyType: {
      type: String,
      required: true,
      enum: [
        'Flat Tyre',
        'Dead Battery Jumpstart',
        'Engine Breakdown',
        'Towing Assistance',
        'Emergency Fuel Delivery',
        'Key Lockout',
        'Other Emergency',
      ],
    },
    status: {
      type: String,
      enum: ['Requested', 'Assigned', 'Dispatched', 'Arrived', 'Resolved', 'Cancelled'],
      default: 'Requested',
      index: true,
    },
    urgency: {
      type: String,
      enum: ['Standard', 'High', 'Critical'],
      default: 'High',
    },
    contactPhone: {
      type: String,
      required: true,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        default: 17.4485,
      },
      longitude: {
        type: Number,
        default: 78.3748,
      },
    },
    serviceCenterAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCenter',
    },
    mechanicAssigned: {
      name: { type: String, default: 'DriveCare Rapid Response Unit' },
      phone: { type: String, default: '+91 91234 56780' },
      etaMinutes: { type: Number, default: 25 },
      vanPlate: { type: String, default: 'TS 08 SOS 9911' },
    },
    notes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RoadsideRequest', roadsideRequestSchema);
