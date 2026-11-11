import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_BASE_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    throw new Error(message);
  }
);

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const registerHospital = async (hospitalData) => {
  try {
    const licenseBase64 = await fileToBase64(hospitalData.license);
    const payload = {
      hospitalName: hospitalData.hospitalName,
      phone: hospitalData.phone,
      email: hospitalData.email,
      password: hospitalData.password,
      street: hospitalData.street,
      city: hospitalData.city,
      postcode: hospitalData.postcode,
      license: licenseBase64,
    };
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

export const registerAmbulance = async (ambulanceData) => {
  try {
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
      picture: pictureBase64,
    };
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

export const getAllHospitals = async (filters = {}) => {
  try {
    return await api.get('/hospitals', { params: filters });
  } catch (error) {
    console.error('Get hospitals error:', error);
    throw error;
  }
};

export const getAllAmbulances = async (filters = {}) => {
  try {
    return await api.get('/ambulances', { params: filters });
  } catch (error) {
    console.error('Get ambulances error:', error);
    throw error;
  }
};

export const getHospitalServicesProfile = async (hospitalId) =>
  await api.get(`/hospital-services/${hospitalId}`);

export const addHospitalDoctor = async (hospitalId, doctorData) =>
  await api.post(`/hospital-services/${hospitalId}/doctors`, doctorData);

export const updateHospitalDoctor = async (hospitalId, doctorId, updates) =>
  await api.patch(`/hospital-services/${hospitalId}/doctors/${doctorId}`, updates);

export const deleteHospitalDoctor = async (hospitalId, doctorId) =>
  await api.delete(`/hospital-services/${hospitalId}/doctors/${doctorId}`);

export const addHospitalService = async (hospitalId, serviceData) =>
  await api.post(`/hospital-services/${hospitalId}/services`, serviceData);

export const updateHospitalService = async (hospitalId, serviceId, updates) =>
  await api.patch(`/hospital-services/${hospitalId}/services/${serviceId}`, updates);

export const deleteHospitalService = async (hospitalId, serviceId) =>
  await api.delete(`/hospital-services/${hospitalId}/services/${serviceId}`);

export const updateHospitalBeds = async (hospitalId, beds) =>
  await api.put(`/hospital-services/${hospitalId}/beds`, { beds });

export const updateHospitalBloodBank = async (hospitalId, bloodBank) =>
  await api.put(`/hospital-services/${hospitalId}/blood-bank`, { bloodBank });

/**
 * Login - tries hospital then ambulance only (service portal)
 */
export const login = async (email, password) => {
  try {
    return await api.post('/hospitals/login', { email, password });
  } catch (_) {}
  try {
    return await api.post('/ambulances/login', { email, password });
  } catch (_) {}
  throw new Error('Invalid email or password');
};

// Ambulance vehicle management (used in AmbulanceProfile / ManageCollection)
export const getAmbulanceVehicles = async (ambulanceId) =>
  await api.get(`/ambulance-vehicles/${ambulanceId}`);

export const addAmbulanceVehicle = async (ambulanceId, vehicleData) =>
  await api.post(`/ambulance-vehicles/${ambulanceId}`, vehicleData);

export const updateAmbulanceVehicle = async (ambulanceId, vehicleId, updates) =>
  await api.patch(`/ambulance-vehicles/${ambulanceId}/${vehicleId}`, updates);

export const deleteAmbulanceVehicle = async (ambulanceId, vehicleId) =>
  await api.delete(`/ambulance-vehicles/${ambulanceId}/${vehicleId}`);

