import Hospital from '../models/Hospital.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { hashPassword, comparePassword, validatePassword } from '../utils/passwordUtils.js';
import { getCityFromCoordinates } from '../utils/reverseGeocoding.js';

/**
 * Register a new hospital
 * @route POST /api/hospitals/register
 */
export const registerHospital = async (req, res) => {
  try {
    const { hospitalName, phone, email, password, street, city, postcode, license, latitude, longitude } = req.body;

    console.log('📝 Hospital registration attempt:', { hospitalName, email });

    // Validate required fields - either text address or GPS location required
    if (!hospitalName || !phone || !email || !password || !license) {
      return res.status(400).json({
        success: false,
        message: 'Hospital name, phone, email, password, and license are required'
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

    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({ email });
    if (existingHospital) {
      return res.status(400).json({
        success: false,
        message: 'Hospital with this email already exists'
      });
    }

    console.log('📤 Uploading license to Cloudinary...');
    
    // Upload license to Cloudinary
    const licenseUrl = await uploadToCloudinary(license, 'emercare/hospitals');

    console.log('💾 Saving hospital to database...');

    // Hash password before saving
    const hashedPassword = hashPassword(password);

    // Prepare hospital data
    const hospitalData = {
      hospitalName,
      phone,
      email,
      password: hashedPassword,
      street: street || '',
      city: city || '',
      postcode: postcode || '',
      license: licenseUrl
    };

    // Add GPS location if provided
    if (hasGPSLocation) {
      hospitalData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
      console.log('📍 GPS location added:', { latitude, longitude });
    }

    // Create new hospital
    const hospital = await Hospital.create(hospitalData);

    console.log('✅ Hospital registered successfully:', hospital._id);

    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully. Verification pending.',
      data: hospital
    });

  } catch (error) {
    console.error('❌ Hospital registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register hospital'
    });
  }
};

/**
 * Get all hospitals
 * @route GET /api/hospitals
 * Query params: city, postcode, street, verified, latitude, longitude, maxDistance
 */
export const getAllHospitals = async (req, res) => {
  try {
    const { city, postcode, street, verified, latitude, longitude, maxDistance } = req.query;
    
    const filter = { isActive: true };
    
    // Location-based search (if lat/lng provided)
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const distance = maxDistance ? parseInt(maxDistance) : 50000; // Default 50km

      // Find hospitals with valid location data within radius
      const hospitals = await Hospital.find({
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

      console.log(`🏥 Found ${hospitals.length} hospitals near location (${lat}, ${lng}) within ${distance/1000}km`);

      return res.status(200).json({
        success: true,
        count: hospitals.length,
        data: hospitals
      });
    }
    
    // Case-insensitive partial match for city
    if (city) filter.city = new RegExp(city, 'i');
    
    // Case-insensitive partial match for postcode
    if (postcode) filter.postcode = new RegExp(postcode, 'i');
    
    // Case-insensitive partial match for street
    if (street) filter.street = new RegExp(street, 'i');
    
    // Exact match for verified status
    if (verified !== undefined) filter.isVerified = verified === 'true';

    const hospitals = await Hospital.find(filter)
      .select('-password -__v')
      .sort({ hospitalName: 1 }); // Sort alphabetically by name

    console.log(`🏥 Found ${hospitals.length} hospitals with filters:`, { city, postcode, street, verified });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });

  } catch (error) {
    console.error('❌ Get hospitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospitals'
    });
  }
};

/**
 * Get hospital by ID
 * @route GET /api/hospitals/:id
 */
export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.status(200).json({
      success: true,
      data: hospital
    });

  } catch (error) {
    console.error('Get hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospital'
    });
  }
};

/**
 * Login hospital
 * @route POST /api/hospitals/login
 */
export const loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Hospital login attempt:', { email });

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find hospital by email
    const hospital = await Hospital.findOne({ email });

    if (!hospital) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password using hashing
    if (!comparePassword(password, hospital.password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ Hospital login successful:', hospital._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: hospital._id,
        hospitalName: hospital.hospitalName,
        email: hospital.email,
        phone: hospital.phone,
        street: hospital.street,
        city: hospital.city,
        postcode: hospital.postcode,
        license: hospital.license,
        isVerified: hospital.isVerified,
        isActive: hospital.isActive,
        userType: 'hospital'
      }
    });

  } catch (error) {
    console.error('❌ Hospital login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * Update hospital profile
 * @route PATCH /api/hospitals/:id
 */
export const updateHospitalProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { hospitalName, phone, email, street, city, postcode } = req.body;

    console.log('📝 Updating hospital profile:', id);
    console.log('Update data:', { hospitalName, phone, email, street, city, postcode });

    const updatedHospital = await Hospital.findByIdAndUpdate(
      id,
      { hospitalName, phone, email, street, city, postcode },
      { new: true, runValidators: true }
    );

    if (!updatedHospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    console.log('✅ Hospital profile updated successfully');
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedHospital
    });
  } catch (error) {
    console.error('❌ Error updating hospital profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

/**
 * Change hospital password
 * @route PATCH /api/hospitals/:id/password
 */
export const changeHospitalPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    console.log('🔒 Changing password for hospital:', id);

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

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Verify current password
    if (!comparePassword(currentPassword, hospital.password)) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash and update password
    hospital.password = hashPassword(newPassword);
    await hospital.save();

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
