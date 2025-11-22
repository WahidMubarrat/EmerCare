import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import donorRoutes from './routes/donorRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import ambulanceRoutes from './routes/ambulanceRoutes.js';
import ambulanceVehicleRoutes from './routes/ambulanceVehicleRoutes.js';
import hospitalServiceRoutes from './routes/hospitalServiceRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// API Routes
app.use('/api/donors', donorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/ambulance-vehicles', ambulanceVehicleRoutes);
app.use('/api/hospital-services', hospitalServiceRoutes);

// Root API
app.get('/api', (req, res) => {
  res.json({ 
    message: 'EmerCare API',
    version: '1.0.0',
    endpoints: {
      donors: '/api/donors',
      hospitals: '/api/hospitals',
      ambulances: '/api/ambulances',
      ambulanceVehicles: '/api/ambulance-vehicles',
      hospitalServices: '/api/hospital-services'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`⏰ Started at ${new Date().toLocaleTimeString()}`);
});
