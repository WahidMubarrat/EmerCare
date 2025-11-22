import mongoose from 'mongoose';
import Hospital from '../models/Hospital.js';
import HospitalServiceProfile from '../models/HospitalServiceProfile.js';

const DEFAULT_BEDS = [
  { name: 'ICU', total: 0, available: 0 },
  { name: 'HDU', total: 0, available: 0 },
  { name: 'Cabin', total: 0, available: 0 },
  { name: 'General Ward', total: 0, available: 0 }
];

const DEFAULT_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const ensureServiceProfile = async (hospitalId) => {
  if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
    throw createHttpError(400, 'Invalid hospital ID');
  }

  const hospitalExists = await Hospital.exists({ _id: hospitalId });
  if (!hospitalExists) {
    throw createHttpError(404, 'Hospital not found');
  }

  let profile = await HospitalServiceProfile.findOne({ hospitalId });
  if (!profile) {
    profile = await HospitalServiceProfile.create({
      hospitalId,
      beds: DEFAULT_BEDS.map(bed => ({ ...bed })),
      bloodBank: DEFAULT_BLOOD_GROUPS.map(group => ({ bloodGroup: group, units: 0 }))
    });
  }

  return profile;
};

export const getHospitalServices = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const profile = await ensureServiceProfile(hospitalId);

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const addDoctor = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const { name, specialty, phone, email, availability } = req.body;

    if (!name || !specialty) {
      throw createHttpError(400, 'Doctor name and specialty are required');
    }

    const profile = await ensureServiceProfile(hospitalId);

    profile.doctors.push({ name, specialty, phone, email, availability });
    await profile.save();

    const newDoctor = profile.doctors[profile.doctors.length - 1];

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      data: newDoctor
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const { hospitalId, doctorId } = req.params;
    const { name, specialty, phone, email, availability } = req.body;

    const profile = await ensureServiceProfile(hospitalId);
    const doctor = profile.doctors.id(doctorId);

    if (!doctor) {
      throw createHttpError(404, 'Doctor not found');
    }

    if (name !== undefined) doctor.name = name;
    if (specialty !== undefined) doctor.specialty = specialty;
    doctor.phone = phone ?? doctor.phone;
    doctor.email = email ?? doctor.email;
    doctor.availability = availability ?? doctor.availability;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    const { hospitalId, doctorId } = req.params;
    const profile = await ensureServiceProfile(hospitalId);

    const doctor = profile.doctors.id(doctorId);
    if (!doctor) {
      throw createHttpError(404, 'Doctor not found');
    }

    doctor.deleteOne();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Doctor removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const addService = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const { name, type, description } = req.body;

    if (!name) {
      throw createHttpError(400, 'Service name is required');
    }

    const profile = await ensureServiceProfile(hospitalId);

    profile.services.push({ name, type, description });
    await profile.save();

    const newService = profile.services[profile.services.length - 1];

    res.status(201).json({
      success: true,
      message: 'Service added successfully',
      data: newService
    });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { hospitalId, serviceId } = req.params;
    const { name, type, description } = req.body;

    const profile = await ensureServiceProfile(hospitalId);
    const service = profile.services.id(serviceId);

    if (!service) {
      throw createHttpError(404, 'Service not found');
    }

    if (name !== undefined) service.name = name;
    if (type !== undefined) service.type = type;
    service.description = description ?? service.description;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { hospitalId, serviceId } = req.params;
    const profile = await ensureServiceProfile(hospitalId);

    const service = profile.services.id(serviceId);
    if (!service) {
      throw createHttpError(404, 'Service not found');
    }

    service.deleteOne();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Service removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateBeds = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const { beds } = req.body;

    if (!Array.isArray(beds)) {
      throw createHttpError(400, 'Beds payload must be an array');
    }

    const sanitizedBeds = beds.map((bed) => {
      if (!bed.name || typeof bed.name !== 'string') {
        throw createHttpError(400, 'Each bed entry must include a name');
      }

      const name = bed.name.trim();
  const total = Number(bed.total ?? 0);
  const available = Number(bed.available ?? 0);

      if (!Number.isFinite(total) || !Number.isFinite(available)) {
        throw createHttpError(400, `Bed counts must be valid numbers for ${name}`);
      }

      if (total < 0 || available < 0) {
        throw createHttpError(400, 'Bed counts cannot be negative');
      }

      if (available > total) {
        throw createHttpError(400, `Available beds cannot exceed total for ${name}`);
      }

      return {
        _id: bed._id && mongoose.Types.ObjectId.isValid(bed._id) ? bed._id : undefined,
        name,
        total,
        available
      };
    });

    const normalizedBeds = sanitizedBeds.length ? sanitizedBeds : DEFAULT_BEDS;

    const profile = await ensureServiceProfile(hospitalId);
    profile.beds = normalizedBeds.map((bed) => ({
      _id: bed._id ? new mongoose.Types.ObjectId(bed._id) : new mongoose.Types.ObjectId(),
      name: bed.name,
      total: bed.total,
      available: bed.available
    }));

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Bed capacities updated successfully',
      data: profile.beds
    });
  } catch (error) {
    next(error);
  }
};

export const updateBloodBank = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const { bloodBank } = req.body;

    if (!Array.isArray(bloodBank)) {
      throw createHttpError(400, 'Blood bank payload must be an array');
    }

    const sanitizedBloodBank = bloodBank.map((item) => {
      if (!item.bloodGroup || !DEFAULT_BLOOD_GROUPS.includes(item.bloodGroup)) {
        throw createHttpError(400, 'Invalid blood group');
      }

      const units = Number(item.units ?? 0);

      if (!Number.isFinite(units)) {
        throw createHttpError(400, `Units must be a valid number for ${item.bloodGroup}`);
      }

      if (units < 0) {
        throw createHttpError(400, 'Blood units cannot be negative');
      }

      return {
        _id: item._id && mongoose.Types.ObjectId.isValid(item._id) ? item._id : undefined,
        bloodGroup: item.bloodGroup,
        units
      };
    });

    const profile = await ensureServiceProfile(hospitalId);
    profile.bloodBank = sanitizedBloodBank.map((item) => ({
      _id: item._id ? new mongoose.Types.ObjectId(item._id) : new mongoose.Types.ObjectId(),
      bloodGroup: item.bloodGroup,
      units: item.units
    }));

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Blood bank updated successfully',
      data: profile.bloodBank
    });
  } catch (error) {
    next(error);
  }
};
