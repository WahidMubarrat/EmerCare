import Donor from '../models/Donor.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { hashPassword, comparePassword, validatePassword } from '../utils/passwordUtils.js';
import { getCityFromCoordinates } from '../utils/reverseGeocoding.js';

/**
 * Register a new blood donor
 * @route POST /api/donors/register
 */
export const registerDonor = async (req, res) => {
  try {
    const { name, phone, email, password, age, street, city, postcode, bloodGroup, picture, latitude, longitude } = req.body;

    // Validate required fields - either text address or GPS location required
    if (!name || !phone || !email || !password || !age || !bloodGroup || !picture) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, email, password, age, blood group, and picture are required'
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

    // Check if donor already exists
    const existingDonor = await Donor.findOne({ email });
    if (existingDonor) {
      return res.status(400).json({
        success: false,
        message: 'Donor with this email already exists'
      });
    }

    // Upload picture to Cloudinary
    const pictureUrl = await uploadToCloudinary(picture, 'emercare/donors');

    // Hash password before saving
    const hashedPassword = hashPassword(password);

    // Prepare donor data
    const donorData = {
      name,
      phone,
      email,
      password: hashedPassword,
      age,
      street: street || '',
      city: city || '',
      postcode: postcode || '',
      bloodGroup,
      picture: pictureUrl
    };

    // Add GPS location if provided
    if (hasGPSLocation) {
      donorData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
      console.log('📍 GPS location added:', { latitude, longitude });
    }

    // Create new donor
    const donor = await Donor.create(donorData);

    res.status(201).json({
      success: true,
      message: 'Donor registered successfully',
      data: donor
    });

  } catch (error) {
    console.error('Donor registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register donor'
    });
  }
};

/**
 * Get all donors
 * @route GET /api/donors
 * Query params: city, bloodGroup, postcode, street, latitude, longitude, maxDistance
 */
export const getAllDonors = async (req, res) => {
  try {
    const { city, bloodGroup, postcode, street, latitude, longitude, maxDistance } = req.query;
    
    const filter = {}; // Remove isActive filter to show all donors
    
    // Location-based search (if lat/lng provided)
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const distance = maxDistance ? parseInt(maxDistance) : 50000; // Default 50km

      if (bloodGroup) filter.bloodGroup = bloodGroup;

      // Find donors with valid location data within radius
      const donors = await Donor.find({
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

      console.log(`🩸 Found ${donors.length} donors near location (${lat}, ${lng}) within ${distance/1000}km`);

      return res.status(200).json({
        success: true,
        count: donors.length,
        data: donors
      });
    }
    
    // Add search filters with case-insensitive regex
    if (city) filter.city = new RegExp(city, 'i');
    if (postcode) filter.postcode = new RegExp(postcode, 'i');
    if (street) filter.street = new RegExp(street, 'i');
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    const donors = await Donor.find(filter)
      .select('-password -__v')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: donors.length,
      data: donors
    });

  } catch (error) {
    console.error('Get donors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donors'
    });
  }
};

/**
 * Get donor by ID
 * @route GET /api/donors/:id
 */
export const getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: donor
    });

  } catch (error) {
    console.error('Get donor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donor'
    });
  }
};

/**
 * Login donor
 * @route POST /api/donors/login
 */
export const loginDonor = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Donor login attempt:', { email });

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find donor by email
    const donor = await Donor.findOne({ email });

    if (!donor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password using hashing
    if (!comparePassword(password, donor.password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ Donor login successful:', donor._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: donor._id,
        name: donor.name,
        email: donor.email,
        phone: donor.phone,
        age: donor.age,
        street: donor.street,
        city: donor.city,
        postcode: donor.postcode,
        bloodGroup: donor.bloodGroup,
        picture: donor.picture,
        isActive: donor.isActive,
        userType: 'donor'
      }
    });

  } catch (error) {
    console.error('❌ Donor login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * Update donor availability
 * @route PATCH /api/donors/:id/availability
 */
export const updateDonorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    console.log('🔄 Updating donor availability:', { id, isActive });

    // Validate isActive is boolean
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    // Find and update donor
    const donor = await Donor.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    console.log('✅ Donor availability updated:', donor._id);

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        id: donor._id,
        isActive: donor.isActive
      }
    });

  } catch (error) {
    console.error('❌ Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability'
    });
  }
};

/**
 * Update donor profile
 * @route PATCH /api/donors/:id
 */
export const updateDonorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, age, street, city, postcode } = req.body;

    console.log('🔄 Updating donor profile:', { id });

    // Find and update donor
    const donor = await Donor.findByIdAndUpdate(
      id,
      { name, phone, email, age, street, city, postcode },
      { new: true, runValidators: true }
    );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    console.log('✅ Donor profile updated:', donor._id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: donor
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * Change donor password
 * @route PATCH /api/donors/:id/password
 */
export const changeDonorPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    console.log('🔐 Changing donor password:', { id });

    // Validate required fields
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

    // Find donor
    const donor = await Donor.findById(id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    // Verify current password
    if (!comparePassword(currentPassword, donor.password)) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash and update password
    donor.password = hashPassword(newPassword);
    await donor.save();

    console.log('✅ Donor password changed:', donor._id);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};
