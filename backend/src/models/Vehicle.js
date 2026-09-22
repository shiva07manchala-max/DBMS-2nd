const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    make: {
      type: String,
      required: [true, 'Please provide vehicle make'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Please provide vehicle model'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Please provide model year'],
    },
    plateNumber: {
      type: String,
      required: [true, 'Please provide license plate number'],
      uppercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    vin: {
      type: String,
      uppercase: true,
      trim: true,
      default: '',
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
      default: 'Petrol',
    },
    transmission: {
      type: String,
      enum: ['Automatic', 'Manual'],
      default: 'Automatic',
    },
    color: {
      type: String,
      default: 'Pearl White',
    },
    mileage: {
      type: Number,
      default: 15000,
    },
    healthScore: {
      type: Number,
      default: 90,
      min: 0,
      max: 100,
    },
    healthDetails: {
      engine: { type: Number, default: 92 },
      battery: { type: Number, default: 88 },
      brakes: { type: Number, default: 85 },
      tyres: { type: Number, default: 90 },
      fluids: { type: Number, default: 95 },
    },
    warranty: {
      status: {
        type: String,
        enum: ['Active', 'Expiring Soon', 'Expired'],
        default: 'Active',
      },
      provider: { type: String, default: 'Manufacturer Factory Warranty' },
      validUntil: { type: Date },
      coverageType: { type: String, default: 'Comprehensive Bumper-to-Bumper' },
    },
    insurance: {
      policyNumber: { type: String, default: 'POL-2026-98321' },
      provider: { type: String, default: 'HDFC ERGO General Insurance' },
      validUntil: { type: Date },
    },
    puc: {
      certificateNumber: { type: String, default: 'PUC-TS-2026-881' },
      validUntil: { type: Date },
    },
    lastServiceDate: {
      type: Date,
    },
    nextServiceDue: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
