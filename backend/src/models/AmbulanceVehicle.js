import mongoose from 'mongoose';

const ambulanceVehicleSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ambulance',
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  driverName: {
    type: String,
    required: true,
    trim: true
  },
  driverPhone: {
    type: String,
    required: true,
    trim: true
  },
  registrationPaper: {
    type: String,
    required: true
  },
  driverLicense: {
    type: String,
    required: true
  },
  fitnessPaper: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
ambulanceVehicleSchema.index({ ownerId: 1 });
ambulanceVehicleSchema.index({ vehicleNumber: 1 });

const AmbulanceVehicle = mongoose.model('AmbulanceVehicle', ambulanceVehicleSchema);

export default AmbulanceVehicle;
