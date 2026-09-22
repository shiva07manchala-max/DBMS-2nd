const mongoose = require('mongoose');

const serviceCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide service center name'],
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: String,
      default: 'Telangana',
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    operatingHours: {
      type: String,
      default: 'Mon - Sat: 8:00 AM - 7:30 PM',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewCount: {
      type: Number,
      default: 142,
    },
    servicesOffered: [
      {
        type: String,
      },
    ],
    totalBays: {
      type: Number,
      default: 12,
    },
    availableBays: {
      type: Number,
      default: 4,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial queries
serviceCenterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ServiceCenter', serviceCenterSchema);
