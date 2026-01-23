import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_BASE_URL = `${BASE_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    throw new Error(message);
  }
);

/**
 * Convert file to base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Register a new donor
 */
export const registerDonor = async (donorData) => {
  try {
    // Convert picture to base64
    const pictureBase64 = await fileToBase64(donorData.picture);

    const payload = {
      name: donorData.name,
      phone: donorData.phone,
      email: donorData.email,
      password: donorData.password,
      age: parseInt(donorData.age),
      street: donorData.street,
      city: donorData.city,
      postcode: donorData.postcode,
      bloodGroup: donorData.bloodGroup,
      picture: pictureBase64
    };

    // Add GPS coordinates if available
    if (donorData.latitude !== null && donorData.longitude !== null) {
      payload.latitude = donorData.latitude;
      payload.longitude = donorData.longitude;
    }

    return await api.post('/donors/register', payload);
  } catch (error) {
    console.error('Donor registration error:', error);
    throw error;
  }
};

/**
 * Register a new hospital
 */
export const registerHospital = async (hospitalData) => {
  try {
    // Convert license to base64
    const licenseBase64 = await fileToBase64(hospitalData.license);

    const payload = {
      hospitalName: hospitalData.hospitalName,
      phone: hospitalData.phone,
      email: hospitalData.email,
      password: hospitalData.password,
      street: hospitalData.street,
      city: hospitalData.city,
      postcode: hospitalData.postcode,
      license: licenseBase64
    };

    // Add GPS coordinates if available
    if (hospitalData.latitude !== null && hospitalData.longitude !== null) {
      payload.latitude = hospitalData.latitude;
      payload.longitude = hospitalData.longitude;
    }

    return await api.post('/hospitals/register', payload);
  } catch (error) {
    console.error('Hospital registration error:', error);
    throw error;
  }
};

/**
 * Register a new ambulance service
 */
export const registerAmbulance = async (ambulanceData) => {
  try {
    // Convert picture to base64
    const pictureBase64 = await fileToBase64(ambulanceData.picture);

    const payload = {
      ownerName: ambulanceData.ownerName,
      phone: ambulanceData.phone,
      email: ambulanceData.email,
      password: ambulanceData.password,
      age: parseInt(ambulanceData.age),
      street: ambulanceData.street,
      city: ambulanceData.city,
      postcode: ambulanceData.postcode,
      picture: pictureBase64
    };

    // Add GPS coordinates if available
    if (ambulanceData.latitude !== null && ambulanceData.longitude !== null) {
      payload.latitude = ambulanceData.latitude;
      payload.longitude = ambulanceData.longitude;
    }

    return await api.post('/ambulances/register', payload);
  } catch (error) {
    console.error('Ambulance registration error:', error);
    throw error;
  }
};

/**
 * Get all donors
 */
export const getAllDonors = async (filters = {}) => {
  try {
    return await api.get('/donors', { params: filters });
  } catch (error) {
    console.error('Get donors error:', error);
    throw error;
  }
};

/**
 * Get all hospitals
 */
export const getAllHospitals = async (filters = {}) => {
  try {
    return await api.get('/hospitals', { params: filters });
  } catch (error) {
    console.error('Get hospitals error:', error);
    throw error;
  }
};

/**
 * Get all ambulances
 */
export const getAllAmbulances = async (filters = {}) => {
  try {
    return await api.get('/ambulances', { params: filters });
  } catch (error) {
    console.error('Get ambulances error:', error);
    throw error;
  }
};

/**
 * Hospital services management
 */
export const getHospitalServicesProfile = async (hospitalId) => {
  return await api.get(`/hospital-services/${hospitalId}`);
};

export const addHospitalDoctor = async (hospitalId, doctorData) => {
  return await api.post(`/hospital-services/${hospitalId}/doctors`, doctorData);
};

export const updateHospitalDoctor = async (hospitalId, doctorId, updates) => {
  return await api.patch(`/hospital-services/${hospitalId}/doctors/${doctorId}`, updates);
};

export const deleteHospitalDoctor = async (hospitalId, doctorId) => {
  return await api.delete(`/hospital-services/${hospitalId}/doctors/${doctorId}`);
};

export const addHospitalService = async (hospitalId, serviceData) => {
  return await api.post(`/hospital-services/${hospitalId}/services`, serviceData);
};

export const updateHospitalService = async (hospitalId, serviceId, updates) => {
  return await api.patch(`/hospital-services/${hospitalId}/services/${serviceId}`, updates);
};

export const deleteHospitalService = async (hospitalId, serviceId) => {
  return await api.delete(`/hospital-services/${hospitalId}/services/${serviceId}`);
};

export const updateHospitalBeds = async (hospitalId, beds) => {
  return await api.put(`/hospital-services/${hospitalId}/beds`, { beds });
};

export const updateHospitalBloodBank = async (hospitalId, bloodBank) => {
  return await api.put(`/hospital-services/${hospitalId}/blood-bank`, { bloodBank });
};

/**
 * Login function that tries all three account types
 */
export const login = async (email, password) => {
  try {
    // Try hospital login
    try {
      return await api.post('/hospitals/login', { email, password });
    } catch (error) {
      // Continue to next type
    }

    // Try donor login
    try {
      return await api.post('/donors/login', { email, password });
    } catch (error) {
      // Continue to next type
    }

    // Try ambulance login
    try {
      return await api.post('/ambulances/login', { email, password });
    } catch (error) {
      // Continue
    }

    // If none worked, throw error
    throw new Error('Invalid email or password');

  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
