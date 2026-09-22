const Vehicle = require('../models/Vehicle');
const Appointment = require('../models/Appointment');
const ServiceRecord = require('../models/ServiceRecord');

// @desc    Get user vehicles
// @route   GET /api/vehicles
// @access  Private
exports.getVehicles = async (req, res, next) => {
  try {
    const filter = req.user.role === 'advisor' || req.user.role === 'admin'
      ? {}
      : { owner: req.user.id };

    const vehicles = await Vehicle.find(filter).populate('owner', 'name email phone');
    res.status(200).json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vehicle details with its service history
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('owner', 'name email phone');
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Check ownership if customer
    if (req.user.role === 'customer' && vehicle.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this vehicle' });
    }

    const appointments = await Appointment.find({ vehicle: vehicle._id }).sort({ scheduledDate: -1 });
    const serviceRecords = await ServiceRecord.find({ vehicle: vehicle._id }).sort({ serviceDate: -1 });

    res.status(200).json({
      success: true,
      vehicle,
      appointments,
      serviceRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new vehicle
// @route   POST /api/vehicles
// @access  Private
exports.addVehicle = async (req, res, next) => {
  try {
    const {
      make,
      model,
      year,
      plateNumber,
      vin,
      fuelType,
      transmission,
      color,
      mileage,
      warrantyProvider,
      warrantyValidUntil,
      insurancePolicyNumber,
      insuranceValidUntil,
    } = req.body;

    const existingPlate = await Vehicle.findOne({ plateNumber: plateNumber.toUpperCase() });
    if (existingPlate) {
      return res.status(400).json({
        success: false,
        message: 'A vehicle with this license plate number is already registered',
      });
    }

    const vehicle = await Vehicle.create({
      owner: req.user.id,
      make,
      model,
      year,
      plateNumber,
      vin: vin || `VIN${Date.now()}`,
      fuelType: fuelType || 'Petrol',
      transmission: transmission || 'Automatic',
      color: color || 'Pearl White',
      mileage: mileage || 12000,
      healthScore: 92,
      healthDetails: {
        engine: 94,
        battery: 90,
        brakes: 88,
        tyres: 92,
        fluids: 96,
      },
      warranty: {
        status: 'Active',
        provider: warrantyProvider || 'Manufacturer Comprehensive 3-Yr Warranty',
        validUntil: warrantyValidUntil || new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
        coverageType: 'Comprehensive Bumper-to-Bumper',
      },
      insurance: {
        policyNumber: insurancePolicyNumber || `POL-HYD-${Math.floor(100000 + Math.random() * 900000)}`,
        provider: 'HDFC ERGO General Insurance',
        validUntil: insuranceValidUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      puc: {
        certificateNumber: `PUC-TS-${Math.floor(10000 + Math.random() * 90000)}`,
        validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
      lastServiceDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      nextServiceDue: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
exports.updateVehicle = async (req, res, next) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (req.user.role === 'customer' && vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this vehicle' });
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (req.user.role === 'customer' && vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this vehicle' });
    }

    await vehicle.deleteOne();
    res.status(200).json({ success: true, message: 'Vehicle removed successfully' });
  } catch (error) {
    next(error);
  }
};
