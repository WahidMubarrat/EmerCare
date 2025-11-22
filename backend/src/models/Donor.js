import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
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
    max: 65
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
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  picture: {
    type: String,
    required: [true, 'Picture is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
donorSchema.index({ city: 1, bloodGroup: 1 });
donorSchema.index({ postcode: 1 });
donorSchema.index({ location: '2dsphere' }); // Geospatial index

const Donor = mongoose.model('Donor', donorSchema);

export default Donor;
