import AmbulanceVehicle from '../models/AmbulanceVehicle.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

/**
 * Add a new ambulance vehicle to collection
 * @route POST /api/ambulance-vehicles
 */
export const addAmbulanceVehicle = async (req, res) => {
  try {
    const { 
      ownerId, 
      vehicleNumber, 
      model, 
      year, 
      driverName, 
      driverPhone,
      registrationPaper,
      driverLicense,
      fitnessPaper
    } = req.body;

    console.log('📝 Adding new ambulance vehicle for owner:', ownerId);

    // Validate required fields
    if (!ownerId || !vehicleNumber || !model || !year || !driverName || !driverPhone || 
        !registrationPaper || !driverLicense || !fitnessPaper) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if vehicle number already exists
    const existingVehicle = await AmbulanceVehicle.findOne({ vehicleNumber });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this registration number already exists'
      });
    }

    console.log('📤 Uploading documents to Cloudinary...');

    // Upload documents to Cloudinary
    const [registrationUrl, licenseUrl, fitnessUrl] = await Promise.all([
      uploadToCloudinary(registrationPaper, 'emercare/ambulance-vehicles/registration'),
      uploadToCloudinary(driverLicense, 'emercare/ambulance-vehicles/license'),
      uploadToCloudinary(fitnessPaper, 'emercare/ambulance-vehicles/fitness')
    ]);

    console.log('💾 Saving vehicle to database...');

    // Create new vehicle
    const vehicle = await AmbulanceVehicle.create({
      ownerId,
      vehicleNumber,
      model,
      year: parseInt(year),
      driverName,
      driverPhone,
      registrationPaper: registrationUrl,
      driverLicense: licenseUrl,
      fitnessPaper: fitnessUrl
    });

    console.log('✅ Ambulance vehicle added successfully:', vehicle._id);

    res.status(201).json({
      success: true,
      message: 'Ambulance vehicle added successfully',
      data: vehicle
    });

  } catch (error) {
    console.error('❌ Add ambulance vehicle error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add ambulance vehicle'
    });
  }
};

/**
 * Get all vehicles for a specific owner
 * @route GET /api/ambulance-vehicles/owner/:ownerId
 */
export const getVehiclesByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;

    console.log('🚑 Fetching vehicles for owner:', ownerId);

    const vehicles = await AmbulanceVehicle.find({ ownerId, isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });

  } catch (error) {
    console.error('❌ Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles'
    });
  }
};

/**
 * Get vehicle by ID
 * @route GET /api/ambulance-vehicles/:id
 */
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await AmbulanceVehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });

  } catch (error) {
    console.error('❌ Get vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle'
    });
  }
};

/**
 * Update ambulance vehicle
 * @route PATCH /api/ambulance-vehicles/:id
 */
export const updateAmbulanceVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicleNumber, model, year, driverName, driverPhone, isAvailable } = req.body;

    console.log('📝 Updating vehicle:', id);

    const updatedVehicle = await AmbulanceVehicle.findByIdAndUpdate(
      id,
      { vehicleNumber, model, year, driverName, driverPhone, isAvailable },
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    console.log('✅ Vehicle updated successfully');

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updatedVehicle
    });

  } catch (error) {
    console.error('❌ Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vehicle'
    });
  }
};

/**
 * Delete ambulance vehicle (soft delete)
 * @route DELETE /api/ambulance-vehicles/:id
 */
export const deleteAmbulanceVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deleting vehicle:', id);

    const vehicle = await AmbulanceVehicle.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    console.log('✅ Vehicle deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vehicle'
    });
  }
};

/**
 * Toggle vehicle availability
 * @route PATCH /api/ambulance-vehicles/:id/availability
 */
export const toggleVehicleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    console.log('🔄 Toggling availability for vehicle:', id, 'to', isAvailable);

    const vehicle = await AmbulanceVehicle.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    console.log('✅ Availability updated');

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: vehicle
    });

  } catch (error) {
    console.error('❌ Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability'
    });
  }
};
