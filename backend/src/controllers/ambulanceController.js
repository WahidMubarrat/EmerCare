import Ambulance from '../models/Ambulance.js';
import AmbulanceVehicle from '../models/AmbulanceVehicle.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { hashPassword, comparePassword, validatePassword } from '../utils/passwordUtils.js';
import { getCityFromCoordinates } from '../utils/reverseGeocoding.js';

/**
 * Register a new ambulance service
 * @route POST /api/ambulances/register
 */
export const registerAmbulance = async (req, res) => {
  try {
    const { ownerName, phone, email, password, age, street, city, postcode, picture, latitude, longitude } = req.body;

    // Validate required fields - either text address or GPS location required
    if (!ownerName || !phone || !email || !password || !age || !picture) {
      return res.status(400).json({
        success: false,
        message: 'Owner name, phone, email, password, age, and picture are required'
      });
    }

    // Check if either text address or GPS location is provided
    const hasTextAddress = street || city || postcode;
    const hasGPSLocation = latitude !== undefined && longitude !== undefined;

    if (!hasTextAddress && !hasGPSLocation) {
      return res.status(400).json({
        success: false,
        message: 'Either text address (street, city, postcode) or GPS location is required'
      });
    }

    // If using text address, all fields are required
    if (hasTextAddress && !hasGPSLocation) {
      if (!street || !city || !postcode) {
        return res.status(400).json({
          success: false,
          message: 'Street, city, and postcode are required for text address'
        });
      }
    }

    // Validate password requirements
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    // Check if ambulance service already exists
    const existingAmbulance = await Ambulance.findOne({ email });
    if (existingAmbulance) {
      return res.status(400).json({
        success: false,
        message: 'Ambulance service with this email already exists'
      });
    }

    // Upload picture to Cloudinary
    const pictureUrl = await uploadToCloudinary(picture, 'emercare/ambulances');

    // Hash password before saving
    const hashedPassword = hashPassword(password);

    // Prepare ambulance data
    const ambulanceData = {
      ownerName,
      phone,
      email,
      password: hashedPassword,
      age,
      street: street || '',
      city: city || '',
      postcode: postcode || '',
      picture: pictureUrl
    };

    // Add GPS location if provided
    if (hasGPSLocation) {
      ambulanceData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
      console.log('📍 GPS location added:', { latitude, longitude });
    }

    // Create new ambulance service
    const ambulance = await Ambulance.create(ambulanceData);

    res.status(201).json({
      success: true,
      message: 'Ambulance service registered successfully. Verification pending.',
      data: ambulance
    });

  } catch (error) {
    console.error('Ambulance registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register ambulance service'
    });
  }
};

/**
 * Get all ambulance services with their vehicles
 * @route GET /api/ambulances
 * Query params: city, postcode, street, verified, latitude, longitude, maxDistance
 */
export const getAllAmbulances = async (req, res) => {
  try {
    const { city, postcode, street, verified, latitude, longitude, maxDistance } = req.query;
    
    const filter = { isActive: true };
    
    // Location-based search (if lat/lng provided)
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const distance = maxDistance ? parseInt(maxDistance) : 50000; // Default 50km

      // Find ambulances with valid location data within radius
      const ambulances = await Ambulance.find({
        ...filter,
        'location.coordinates': { $exists: true, $ne: null },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: distance // in meters
          }
        }
      }).select('-password -__v');

      console.log(`🚑 Found ${ambulances.length} ambulances near location (${lat}, ${lng}) within ${distance/1000}km`);

      // Fetch vehicles for each ambulance
      const ambulancesWithVehicles = await Promise.all(
        ambulances.map(async (ambulance) => {
          const vehicles = await AmbulanceVehicle.find({ ambulanceId: ambulance._id });
          return {
            ...ambulance.toObject(),
            vehicles,
            totalVehicles: vehicles.length,
            availableVehicles: vehicles.filter(v => v.isAvailable).length
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: ambulancesWithVehicles.length,
        data: ambulancesWithVehicles
      });
    }
    
    // Add search filters with case-insensitive regex
    if (city) filter.city = new RegExp(city, 'i');
    if (postcode) filter.postcode = new RegExp(postcode, 'i');
    if (street) filter.street = new RegExp(street, 'i');
    if (verified !== undefined) filter.isVerified = verified === 'true';

    // Get all ambulances matching the filter
    const ambulances = await Ambulance.find(filter)
      .select('-password -__v')
      .sort({ ownerName: 1 });

    // Import AmbulanceVehicle model dynamically to avoid circular dependency
    const AmbulanceVehicle = (await import('../models/AmbulanceVehicle.js')).default;

    // For each ambulance, get their active vehicles
    const ambulancesWithVehicles = await Promise.all(
      ambulances.map(async (ambulance) => {
        const vehicles = await AmbulanceVehicle.find({ 
          ownerId: ambulance._id, 
          isActive: true 
        }).select('-__v');

        return {
          ...ambulance.toObject(),
          vehicles: vehicles || [],
          totalVehicles: vehicles.length,
          availableVehicles: vehicles.filter(v => v.isAvailable).length
        };
      })
    );

    res.status(200).json({
      success: true,
      count: ambulancesWithVehicles.length,
      data: ambulancesWithVehicles
    });

  } catch (error) {
    console.error('Get ambulances error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ambulance services'
    });
  }
};

/**
 * Get ambulance service by ID
 * @route GET /api/ambulances/:id
 */
export const getAmbulanceById = async (req, res) => {
  try {
    const ambulance = await Ambulance.findById(req.params.id);

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance service not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ambulance
    });

  } catch (error) {
    console.error('Get ambulance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ambulance service'
    });
  }
};

/**
 * Login ambulance
 * @route POST /api/ambulances/login
 */
export const loginAmbulance = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Ambulance login attempt:', { email });

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find ambulance by email
    const ambulance = await Ambulance.findOne({ email });

    if (!ambulance) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password using hashing
    if (!comparePassword(password, ambulance.password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ Ambulance login successful:', ambulance._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: ambulance._id,
        ownerName: ambulance.ownerName,
        email: ambulance.email,
        phone: ambulance.phone,
        age: ambulance.age,
        street: ambulance.street,
        city: ambulance.city,
        postcode: ambulance.postcode,
        picture: ambulance.picture,
        isVerified: ambulance.isVerified,
        isActive: ambulance.isActive,
        userType: 'ambulance'
      }
    });

  } catch (error) {
    console.error('❌ Ambulance login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * Update ambulance profile
 * @route PATCH /api/ambulances/:id
 */
export const updateAmbulanceProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerName, phone, email, age, street, city, postcode } = req.body;

    console.log('📝 Updating ambulance profile:', id);
    console.log('Update data:', { ownerName, phone, email, age, street, city, postcode });

    const updatedAmbulance = await Ambulance.findByIdAndUpdate(
      id,
      { ownerName, phone, email, age, street, city, postcode },
      { new: true, runValidators: true }
    );

    if (!updatedAmbulance) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance not found'
      });
    }

    console.log('✅ Ambulance profile updated successfully');
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedAmbulance
    });
  } catch (error) {
    console.error('❌ Error updating ambulance profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

/**
 * Change ambulance password
 * @route PATCH /api/ambulances/:id/password
 */
export const changeAmbulancePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    console.log('🔒 Changing password for ambulance:', id);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password requirements
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    const ambulance = await Ambulance.findById(id);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance not found'
      });
    }

    // Verify current password
    if (!comparePassword(currentPassword, ambulance.password)) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash and update password
    ambulance.password = hashPassword(newPassword);
    await ambulance.save();

    console.log('✅ Password changed successfully');
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};
