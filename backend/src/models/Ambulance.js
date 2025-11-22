import mongoose from 'mongoose';

const ambulanceSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
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
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: 18,
    max: 70
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
  picture: {
    type: String,
    required: [true, 'Picture is required']
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
ambulanceSchema.index({ city: 1 });
ambulanceSchema.index({ postcode: 1 });
ambulanceSchema.index({ isVerified: 1, isActive: 1 });
ambulanceSchema.index({ location: '2dsphere' }); // Geospatial index

const Ambulance = mongoose.model('Ambulance', ambulanceSchema);

export default Ambulance;
