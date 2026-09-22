const mongoose = require('mongoose');

const serviceRecordSchema = new mongoose.Schema(
  {
    recordId: {
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
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    serviceCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCenter',
      required: true,
    },
    serviceDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    mileageAtService: {
      type: Number,
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
    },
    workSummary: {
      type: String,
      required: true,
    },
    items: [
      {
        description: { type: String, required: true },
        category: {
          type: String,
          enum: ['Labor', 'Parts', 'Fluids', 'Consumables', 'Inspection'],
          default: 'Labor',
        },
        cost: { type: Number, required: true },
      },
    ],
    totalLabor: {
      type: Number,
      default: 0,
    },
    totalParts: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Waived'],
      default: 'Paid',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Online / UPI', 'Credit Card', 'Cash at Center', 'Net Banking'],
      default: 'Online / UPI',
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    technicianName: {
      type: String,
      default: 'Lead Master Tech - Rajesh K.',
    },
    warrantyApplied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ServiceRecord', serviceRecordSchema);
