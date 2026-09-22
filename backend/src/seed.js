
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const ServiceCenter = require('./models/ServiceCenter');
const Appointment = require('./models/Appointment');
const ServiceRecord = require('./models/ServiceRecord');
const RoadsideRequest = require('./models/RoadsideRequest');
const Notification = require('./models/Notification');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/drivecare_db');
    console.log('[Seed] Connected to MongoDB');

    // Clean existing collections
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await ServiceCenter.deleteMany({});
    await Appointment.deleteMany({});
    await ServiceRecord.deleteMany({});
    await RoadsideRequest.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Seed] Cleared existing data');

    // 1. Create Users
    const customerShiva = await User.create({
      name: 'Manchala Shiva',
      email: 'shiva@drivecare.com',
      password: 'Password@123',
      phone: '+91 98765 43210',
      role: 'customer',
      city: 'Hyderabad',
      address: 'Plot 42, Hitech City Main Road, Madhapur, Hyderabad - 500081',
      preferredLanguage: 'English',
      loyaltyPoints: 2480,
      avatarInitials: 'MS',
    });

    const customerBhavan = await User.create({
      name: 'P. Bhavan',
      email: 'bhavan@drivecare.com',
      password: 'Password@123',
      phone: '+91 98480 11223',
      role: 'customer',
      city: 'Hyderabad',
      address: 'Road No 10, Banjara Hills, Hyderabad',
      preferredLanguage: 'English',
      loyaltyPoints: 1200,
      avatarInitials: 'PB',
    });

    const advisorRajesh = await User.create({
      name: 'N. Sainathreddy (Lead Advisor)',
      email: 'advisor@drivecare.com',
      password: 'Password@123',
      phone: '+91 91234 56789',
      role: 'advisor',
      city: 'Hyderabad',
      address: 'DriveCare Hub, Bachupally, Hyderabad',
      loyaltyPoints: 0,
      avatarInitials: 'NS',
    });

    console.log('[Seed] Created Users');

    // 2. Create Service Centers
    const centers = await ServiceCenter.create([
      {
        name: 'DriveCare Flagship Service Hub - Hitech City',
        code: 'DC-HYD-01',
        address: 'Phase 2, Mindspace Circle, Hitech City, Hyderabad',
        city: 'Hyderabad',
        state: 'Telangana',
        phone: '+91 40 4567 8900',
        email: 'hitech@drivecare.com',
        location: { type: 'Point', coordinates: [78.3728, 17.4435] },
        operatingHours: 'Mon - Sun: 7:30 AM - 8:30 PM',
        rating: 4.9,
        reviewCount: 320,
        servicesOffered: ['Periodic Maintenance', 'Tyre Care', 'AC Service', 'Dent & Paint', 'EV Care'],
        totalBays: 16,
        availableBays: 5,
        isOpen: true,
      },
      {
        name: 'DriveCare Express Center - Bachupally / Bowrampet',
        code: 'DC-HYD-02',
        address: 'Near KLH Campus Road, Bowrampet, Hyderabad',
        city: 'Hyderabad',
        state: 'Telangana',
        phone: '+91 40 4567 8901',
        email: 'bowrampet@drivecare.com',
        location: { type: 'Point', coordinates: [78.3892, 17.5412] },
        operatingHours: 'Mon - Sat: 8:00 AM - 7:00 PM',
        rating: 4.8,
        reviewCount: 184,
        servicesOffered: ['Quick Oil Change', 'Wheel Alignment', 'Brake Care', 'Full Inspection'],
        totalBays: 8,
        availableBays: 3,
        isOpen: true,
      },
      {
        name: 'DriveCare Mega Workshop - Gachibowli',
        code: 'DC-HYD-03',
        address: 'Outer Ring Road Junction, Gachibowli, Hyderabad',
        city: 'Hyderabad',
        state: 'Telangana',
        phone: '+91 40 4567 8902',
        email: 'gachibowli@drivecare.com',
        location: { type: 'Point', coordinates: [78.3489, 17.4401] },
        operatingHours: 'Mon - Sun: 24/7 (Emergency & Service)',
        rating: 4.9,
        reviewCount: 512,
        servicesOffered: ['Heavy Mechanical', 'Periodic Service', 'Body Shop', 'Roadside Dispatch'],
        totalBays: 24,
        availableBays: 7,
        isOpen: true,
      },
      {
        name: 'DriveCare City Center - Banjara Hills',
        code: 'DC-HYD-04',
        address: 'Road No 12, Banjara Hills, Hyderabad',
        city: 'Hyderabad',
        state: 'Telangana',
        phone: '+91 40 4567 8903',
        email: 'banjara@drivecare.com',
        location: { type: 'Point', coordinates: [78.4356, 17.4156] },
        operatingHours: 'Mon - Sat: 8:30 AM - 7:30 PM',
        rating: 4.7,
        reviewCount: 230,
        servicesOffered: ['Periodic Maintenance', 'Ceramic Coating', 'AC Care', 'Diagnostics'],
        totalBays: 10,
        availableBays: 2,
        isOpen: true,
      },
    ]);

    console.log('[Seed] Created Service Centers');

    // 3. Create Vehicles for Shiva
    const creta = await Vehicle.create({
      owner: customerShiva._id,
      make: 'Hyundai',
      model: 'Creta SX (O) Turbo',
      year: 2024,
      plateNumber: 'TS 09 FH 4521',
      vin: 'MALC141CPLM982143',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      color: 'Titan Grey Metallic',
      mileage: 18450,
      healthScore: 92,
      healthDetails: {
        engine: 94,
        battery: 91,
        brakes: 86,
        tyres: 92,
        fluids: 96,
      },
      warranty: {
        status: 'Active',
        provider: 'Hyundai 3-Year Wonder Warranty',
        validUntil: new Date('2027-04-15'),
        coverageType: 'Comprehensive Bumper-to-Bumper',
      },
      insurance: {
        policyNumber: 'HDFC-ERGO-2024-8841',
        provider: 'HDFC ERGO General Insurance',
        validUntil: new Date('2027-01-18'),
      },
      puc: {
        certificateNumber: 'PUC-TS-2026-904',
        validUntil: new Date('2026-11-20'),
      },
      lastServiceDate: new Date('2026-05-12'),
      nextServiceDue: new Date('2026-11-12'),
    });

    const swift = await Vehicle.create({
      owner: customerShiva._id,
      make: 'Maruti Suzuki',
      model: 'Swift ZXi Plus',
      year: 2023,
      plateNumber: 'TS 07 EP 7789',
      vin: 'MA3FHB22SPM119482',
      fuelType: 'Petrol',
      transmission: 'Manual',
      color: 'Solid Fire Red',
      mileage: 26800,
      healthScore: 88,
      healthDetails: {
        engine: 89,
        battery: 84,
        brakes: 82,
        tyres: 90,
        fluids: 93,
      },
      warranty: {
        status: 'Active',
        provider: 'Maruti Suzuki Extended Care',
        validUntil: new Date('2028-08-10'),
        coverageType: 'Powertrain & Mechanical',
      },
      insurance: {
        policyNumber: 'ICICI-LOMB-7789-23',
        provider: 'ICICI Lombard Motor Insurance',
        validUntil: new Date('2026-12-05'),
      },
      puc: {
        certificateNumber: 'PUC-TS-2026-441',
        validUntil: new Date('2026-10-15'),
      },
      lastServiceDate: new Date('2026-04-06'),
      nextServiceDue: new Date('2026-10-06'),
    });

    const nexon = await Vehicle.create({
      owner: customerBhavan._id,
      make: 'Tata',
      model: 'Nexon EV Empowered',
      year: 2024,
      plateNumber: 'TS 10 EV 1008',
      vin: 'MAT612918REM44810',
      fuelType: 'Electric',
      transmission: 'Automatic',
      color: 'Pristine White',
      mileage: 14200,
      healthScore: 96,
      healthDetails: {
        engine: 98,
        battery: 95,
        brakes: 94,
        tyres: 95,
        fluids: 99,
      },
      warranty: {
        status: 'Active',
        provider: 'Tata EV 8-Year High Voltage Battery Warranty',
        validUntil: new Date('2032-03-01'),
        coverageType: 'Battery & Motor Warranty',
      },
      insurance: {
        policyNumber: 'TATA-AIG-EV-2024',
        provider: 'Tata AIG General Insurance',
        validUntil: new Date('2027-02-28'),
      },
      puc: {
        certificateNumber: 'PUC-EV-EXEMPT-2026',
        validUntil: new Date('2030-01-01'),
      },
      lastServiceDate: new Date('2026-06-18'),
      nextServiceDue: new Date('2026-12-18'),
    });

    console.log('[Seed] Created Vehicles');

    // 4. Create Appointments
    await Appointment.create([
      {
        bookingId: 'DC-2026-1048',
        user: customerShiva._id,
        vehicle: creta._id,
        serviceCenter: centers[0]._id,
        serviceType: 'Periodic Maintenance',
        scheduledDate: new Date('2026-09-28T10:30:00.000Z'),
        timeSlot: '10:30 AM',
        status: 'Confirmed',
        pickupDropRequired: true,
        pickupAddress: 'Plot 42, Hitech City Main Road, Madhapur',
        estimatedCost: 2850,
        customerNotes: 'Please check mild squeak from front left brake pads during slow braking.',
      },
      {
        bookingId: 'DC-2026-0991',
        user: customerShiva._id,
        vehicle: swift._id,
        serviceCenter: centers[1]._id,
        serviceType: 'Tyre & Wheel Care',
        scheduledDate: new Date('2026-10-02T15:00:00.000Z'),
        timeSlot: '03:00 PM',
        status: 'Pending',
        pickupDropRequired: false,
        estimatedCost: 699,
        customerNotes: 'Wheel alignment and computerized wheel balancing required.',
      },
    ]);

    console.log('[Seed] Created Appointments');

    // 5. Create Service Records & Invoices
    await ServiceRecord.create([
      {
        recordId: 'SR-2026-8801',
        user: customerShiva._id,
        vehicle: creta._id,
        serviceCenter: centers[0]._id,
        serviceDate: new Date('2026-05-12'),
        mileageAtService: 15100,
        serviceType: 'Periodic Maintenance (15,000 KM Service)',
        workSummary: 'Completed 15K periodic maintenance: Engine oil synthetic replacement, oil filter, air filter, pollen filter replaced, multi-point electronic diagnostics, fluid top-up.',
        items: [
          { description: 'Synthetic Engine Oil 0W-20 (4L)', category: 'Fluids', cost: 1850 },
          { description: 'OEM Engine Oil Filter Cartridge', category: 'Parts', cost: 380 },
          { description: 'Cabin AC Air Purifying Filter', category: 'Parts', cost: 650 },
          { description: 'Scheduled Periodic Service Labor & 40-pt Inspection', category: 'Labor', cost: 1200 },
        ],
        totalLabor: 1200,
        totalParts: 2880,
        taxAmount: 734,
        grandTotal: 4814,
        paymentStatus: 'Paid',
        paymentMethod: 'Online / UPI',
        invoiceNumber: 'INV-2026-10492',
        invoiceDate: new Date('2026-05-12'),
        technicianName: 'Rajesh Kumar (Senior Diagnostic Tech)',
      },
      {
        recordId: 'SR-2026-8802',
        user: customerShiva._id,
        vehicle: swift._id,
        serviceCenter: centers[1]._id,
        serviceDate: new Date('2026-04-06'),
        mileageAtService: 24200,
        serviceType: 'Brake Care & AC Disinfection',
        workSummary: 'Front disc brake caliper cleaning, pad chamfering, brake fluid bleeding, ultrasonic AC evaporator sterilization.',
        items: [
          { description: 'Brake Caliper Servicing & Rotor Polishing', category: 'Labor', cost: 850 },
          { description: 'DOT-4 High Temp Brake Fluid', category: 'Fluids', cost: 320 },
          { description: 'AC Evaporator Ozone Treatment', category: 'Consumables', cost: 750 },
        ],
        totalLabor: 850,
        totalParts: 1070,
        taxAmount: 345,
        grandTotal: 2265,
        paymentStatus: 'Paid',
        paymentMethod: 'Credit Card',
        invoiceNumber: 'INV-2026-09418',
        invoiceDate: new Date('2026-04-06'),
        technicianName: 'Suresh V. (Brake Specialist)',
      },
    ]);

    console.log('[Seed] Created Service Records');

    // 6. Create Roadside Request
    await RoadsideRequest.create({
      requestId: 'SOS-2026-441',
      user: customerShiva._id,
      vehicle: swift._id,
      emergencyType: 'Flat Tyre',
      status: 'Dispatched',
      urgency: 'High',
      contactPhone: '+91 98765 43210',
      location: {
        address: 'Near ORR Exit 13, Gachibowli, Hyderabad',
        latitude: 17.4367,
        longitude: 78.3512,
      },
      serviceCenterAssigned: centers[2]._id,
      mechanicAssigned: {
        name: 'Rapid Response Unit 02 - Vikram Rao',
        phone: '+91 94401 88771',
        etaMinutes: 14,
        vanPlate: 'TS 09 SOS 1100',
      },
      notes: 'Right rear tyre puncture on highway shoulder. Spare wheel available.',
    });

    console.log('[Seed] Created Roadside SOS');

    // 7. Create Notifications
    await Notification.create([
      {
        user: customerShiva._id,
        title: 'Appointment Confirmed! 🚗',
        message: 'Your Periodic Maintenance for Hyundai Creta is booked for 28 Sep at 10:30 AM.',
        type: 'booking_status',
        isRead: false,
        link: '/bookings',
      },
      {
        user: customerShiva._id,
        title: 'Roadside Rescue En Route 🆘',
        message: 'Patrol Unit 02 (Vikram Rao) is 14 minutes away from your location on ORR Exit 13.',
        type: 'roadside_update',
        isRead: false,
        link: '/roadside',
      },
      {
        user: customerShiva._id,
        title: 'Maintenance Health Checkup Due',
        message: 'Maruti Swift is due for 6-month seasonal tyre check and alignment.',
        type: 'service_reminder',
        isRead: true,
        link: '/services',
      },
    ]);

    console.log('[Seed] Created Notifications');
    console.log('✅ ALL SEED DATA SUCCESSFULLY POPULATED IN MONGODB!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
