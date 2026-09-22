const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for frontend UI
app.use(express.static(path.join(__dirname, '../public')));

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'DriveCare Automotive Self-Service API',
    course: 'Database Systems Engineering (25CS1302E)',
    team: ['P. Bhavan', 'M. Shiva', 'N. Sainathreddy'],
    timestamp: new Date().toISOString()
  });
});

// API Routes Mount
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/service-records', require('./routes/serviceRecordRoutes'));
app.use('/api/roadside', require('./routes/roadsideRoutes'));
app.use('/api/service-centers', require('./routes/serviceCenterRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Serve frontend for any unmatched non-API routes
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Route Not Found' });
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`======================================================`);
  console.log(`🚀 DriveCare Full-Stack System running on port ${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📱 Other Laptops / Devices: http://10.250.2.144:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================`);
});
