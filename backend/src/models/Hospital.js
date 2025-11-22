import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  street: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  postcode: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  license: {
    type: String,
    required: [true, 'License document is required']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
hospitalSchema.index({ city: 1 });
hospitalSchema.index({ postcode: 1 });
hospitalSchema.index({ isVerified: 1, isActive: 1 });
hospitalSchema.index({ location: '2dsphere' }); // Geospatial index

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
