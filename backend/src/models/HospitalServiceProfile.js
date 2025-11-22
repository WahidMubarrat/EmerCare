import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  specialty: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  availability: {
    type: String,
    trim: true,
    default: 'Available'
  }
}, { _id: true });

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Test', 'Treatment'],
    default: 'Test'
  },
  description: {
    type: String,
    trim: true
  }
}, { _id: true });

const bedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  total: {
    type: Number,
    default: 0,
    min: 0
  },
  available: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: true });

const bloodBankSchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  units: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: true });

const hospitalServiceSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
    unique: true
  },
  doctors: [doctorSchema],
  services: [serviceSchema],
  beds: [bedSchema],
  bloodBank: [bloodBankSchema],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

hospitalServiceSchema.index({ hospitalId: 1 });

const HospitalServiceProfile = mongoose.model('HospitalServiceProfile', hospitalServiceSchema);

export default HospitalServiceProfile;
