# Address Input Feature - Implementation Summary

## Overview
Implemented a dual-mode address input system for all three registration forms (Hospital, Donor, Ambulance) that allows users to choose between:
1. **Manual Text Entry** - Traditional address fields (street, city, postcode)
2. **GPS Location Capture** - Browser-based geolocation with automatic coordinate capture

## Frontend Implementation

### New Components

#### 1. `AddressInput.jsx`
**Location:** `frontend/src/components/AddressInput.jsx`

**Purpose:** Reusable address input component with toggle between text and GPS modes

**Key Features:**
- Radio button selector for address type (📝 Text / 📍 GPS)
- Conditional rendering of input fields based on selected mode
- State management for switching between modes
- Error handling for both address types
- Auto-clearing opposite mode data when switching

**Props:**
```javascript
{
  addressData: { street, city, postcode, latitude, longitude },
  onAddressChange: (addressData) => {},
  onLocationChange: (location, error) => {},
  errors: { street, city, postcode, location }
}
```

#### 2. `AddressInput.css`
**Location:** `frontend/src/styles/AddressInput.css`

**Styling:**
- Modern radio button design with visual feedback
- Red gradient theme matching app design (#dc143c)
- Responsive layout for mobile devices
- Smooth transitions and hover effects
- Clear visual distinction between selected/unselected modes

### Updated Registration Forms

All three registration forms updated:
- `frontend/src/pages/HospitalRegister.jsx`
- `frontend/src/pages/DonorRegister.jsx`
- `frontend/src/pages/AmbulanceRegister.jsx`

**Changes Made:**
1. **State Management:**
   - Added `latitude` and `longitude` to formData state
   - Initialize as `null` instead of empty strings

2. **New Handler Functions:**
   ```javascript
   handleAddressChange(addressData) // Updates street, city, postcode
   handleLocationChange(location, error) // Updates lat/lng and clears text fields
   ```

3. **Validation Logic:**
   - Check if either text address OR GPS location is provided
   - Require all text fields only if text mode is used
   - Accept GPS coordinates as alternative to text address
   - Flexible validation: `hasTextAddress` or `hasGPSLocation`

4. **Component Integration:**
   - Replaced individual address input fields with `<AddressInput />` component
   - Passes address data, handlers, and errors as props
   - Maintains consistent form structure

### API Service Updates

**Location:** `frontend/src/services/api.js`

**Changes to Registration Functions:**
```javascript
// Build payload object
const payload = { ...requiredFields };

// Conditionally add GPS coordinates
if (data.latitude !== null && data.longitude !== null) {
  payload.latitude = data.latitude;
  payload.longitude = data.longitude;
}

// Send to backend
fetch(url, { body: JSON.stringify(payload) })
```

**Applied to:**
- `registerHospital()` - Sends lat/lng with hospital data
- `registerDonor()` - Sends lat/lng with donor data  
- `registerAmbulance()` - Sends lat/lng with ambulance data

## Backend Implementation

### Controller Updates

All three controllers updated with identical logic:
- `backend/src/controllers/hospitalController.js`
- `backend/src/controllers/donorController.js`
- `backend/src/controllers/ambulanceController.js`

**Key Changes:**

#### 1. Request Body Extraction
```javascript
const { 
  ...existingFields, 
  latitude, 
  longitude 
} = req.body;
```

#### 2. Flexible Validation
```javascript
// Check if either text address or GPS location is provided
const hasTextAddress = street || city || postcode;
const hasGPSLocation = latitude !== undefined && longitude !== undefined;

if (!hasTextAddress && !hasGPSLocation) {
  return res.status(400).json({
    success: false,
    message: 'Either text address or GPS location is required'
  });
}

// Validate text address fields only if text mode is used
if (hasTextAddress && !hasGPSLocation) {
  if (!street || !city || !postcode) {
    return res.status(400).json({
      success: false,
      message: 'Street, city, and postcode are required for text address'
    });
  }
}
```

#### 3. Data Preparation with Optional GPS
```javascript
// Prepare data object
const data = {
  ...requiredFields,
  street: street || '',
  city: city || '',
  postcode: postcode || ''
};

// Add GPS location if provided
if (hasGPSLocation) {
  data.location = {
    type: 'Point',
    coordinates: [parseFloat(longitude), parseFloat(latitude)]
  };
  console.log('📍 GPS location added:', { latitude, longitude });
}

// Create document
await Model.create(data);
```

**GeoJSON Format:**
```javascript
location: {
  type: 'Point',
  coordinates: [longitude, latitude] // [lng, lat] order for MongoDB
}
```

## Database Schema

No changes required - existing schemas already support location field:

```javascript
location: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: undefined
  }
},
```

**Geospatial Index:** 2dsphere indexes already created on location field

## User Flow

### Text Address Mode (Default)
1. User sees radio buttons: "📝 Enter Address Manually" (selected) and "📍 Use GPS Location"
2. Form shows three text fields: Street Address, City, Postcode
3. User fills in traditional address fields
4. On submit: Only text fields sent to backend
5. Backend saves text address, location field remains undefined

### GPS Location Mode
1. User clicks "📍 Use GPS Location" radio button
2. Text fields disappear, LocationCapture component appears
3. User clicks "📍 Capture My Location" button
4. Browser prompts for location permission
5. On allow: GPS coordinates captured, "✓ Location Captured" shown
6. Optional: Text fields auto-populated from reverse geocoding (future enhancement)
7. On submit: latitude/longitude sent to backend
8. Backend creates GeoJSON Point with coordinates, saves to location field

### Switching Between Modes
- Switching to GPS: Text fields cleared
- Switching to Text: GPS coordinates cleared
- Only one mode active at a time
- Form validation adapts to selected mode

## Error Handling

### Frontend Errors
- **Location permission denied:** Shows error message below LocationCapture button
- **Geolocation timeout:** "Failed to get location" error
- **Missing address data:** Form validation prevents submission
- **Network errors:** Caught and displayed via alert

### Backend Errors
- **No address provided:** 400 error - "Either text address or GPS location is required"
- **Incomplete text address:** 400 error - "Street, city, and postcode are required for text address"
- **Invalid GPS format:** Mongoose validation error
- **Database errors:** 500 error with appropriate message

## Testing Checklist

### Manual Testing
- [ ] Hospital registration with text address
- [ ] Hospital registration with GPS location
- [ ] Donor registration with text address
- [ ] Donor registration with GPS location
- [ ] Ambulance registration with text address
- [ ] Ambulance registration with GPS location
- [ ] Switch from text to GPS mode (data clears)
- [ ] Switch from GPS to text mode (coordinates clear)
- [ ] Submit with no address data (validation error)
- [ ] Submit with incomplete text address (validation error)
- [ ] GPS permission denied (error handling)
- [ ] GPS location captured successfully
- [ ] "Near Me" search with newly registered GPS records

### Database Verification
```javascript
// Check location field after GPS registration
db.hospitals.findOne({ email: 'test@test.com' })
// Expected: location: { type: 'Point', coordinates: [lng, lat] }

// Check location field after text registration  
db.hospitals.findOne({ email: 'text@test.com' })
// Expected: location: undefined, city: 'London'
```

## Benefits

1. **Flexibility:** Users can choose their preferred input method
2. **Accuracy:** GPS provides precise coordinates for proximity search
3. **Privacy:** Text-only option for users who don't want to share GPS
4. **Compatibility:** Works with existing "Near Me" search feature
5. **Data Quality:** GPS registration populates location field for better search results
6. **User Experience:** Simple toggle between modes, clear visual feedback
7. **Validation:** Smart validation adapts to selected address mode

## Future Enhancements

1. **Reverse Geocoding on Capture:** Auto-fill text fields when GPS captured
2. **Address Autocomplete:** Google Places API for text address
3. **Map Preview:** Show pin on map for GPS location
4. **Edit Location:** Allow users to adjust GPS pin position
5. **Hybrid Mode:** Allow both text and GPS simultaneously
6. **Location Verification:** Verify GPS matches city for fraud prevention

## Notes

- GPS mode uses browser Geolocation API (HTTPS required in production)
- MongoDB stores coordinates as [longitude, latitude] (GeoJSON standard)
- Existing "Near Me" search now has data to work with when users register via GPS
- Text-only registrations won't appear in proximity searches (by design)
- Backend logs GPS additions: "📍 GPS location added: { latitude, longitude }"
