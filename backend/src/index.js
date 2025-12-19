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

// CORS configuration - allow frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.length > 0 && allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      // In development, allow all origins for easier testing
      callback(null, true);
    } else {
      // In production, only allow specified origins
      // Update FRONTEND_URL environment variable with your Vercel URL
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

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
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📡 API endpoints available at http://${HOST}:${PORT}/api`);
  console.log(`⏰ Started at ${new Date().toLocaleTimeString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
