import Hospital from '../models/Hospital.js';
import Donor from '../models/Donor.js';
import HospitalServiceProfile from '../models/HospitalServiceProfile.js';
import { queryOpenRouter, isAiConfigured } from '../utils/openrouter.js';

const MAX_DISTANCE = 50000; // 50km default radius
const NEARBY_LIMIT = 5;
const HISTORY_LIMIT = 10;

const BLOOD_GROUP_REGEX = /(AB\+|AB-|A\+|A-|B\+|B-|O\+|O-)/;

/**
 * Haversine distance in kilometres between two coordinates.
 */
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const extractBloodGroup = (text) => {
  const match = BLOOD_GROUP_REGEX.exec(text);
  return match ? match[1] : null;
};

const nearFilter = (lat, lng) => ({
  'location.coordinates': { $exists: true, $ne: null },
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [lng, lat] },
      $maxDistance: MAX_DISTANCE,
    },
  },
});

const withDistanceKm = (items, lat, lng) =>
  items.map((item) => {
    const coords = item.location?.coordinates;
    if (coords) item.distanceKm = Number(haversineKm(lat, lng, coords[1], coords[0]).toFixed(1));
    return item;
  });

const fetchNearbyHospitals = async ({ lat, lng, city }) => {
  const filter = { isActive: true };
  if (lat !== null && lng !== null) Object.assign(filter, nearFilter(lat, lng));
  else if (city) filter.city = new RegExp(city, 'i');

  const hospitals = await Hospital.find(filter)
    .select('hospitalName phone email street city postcode location')
    .limit(NEARBY_LIMIT);

  return (lat !== null && lng !== null ? withDistanceKm(hospitals, lat, lng) : hospitals).map(
    (h) => ({
      id: h._id,
      hospitalName: h.hospitalName,
      phone: h.phone,
      street: h.street,
      city: h.city,
      postcode: h.postcode,
      distanceKm: h.distanceKm,
    })
  );
};

const fetchNearbyDonors = async ({ lat, lng, city, bloodGroup }) => {
  const filter = { isActive: true };
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (lat !== null && lng !== null) Object.assign(filter, nearFilter(lat, lng));
  else if (city) filter.city = new RegExp(city, 'i');

  const donors = await Donor.find(filter)
    .select('name phone bloodGroup street city postcode location')
    .limit(NEARBY_LIMIT);

  return (lat !== null && lng !== null ? withDistanceKm(donors, lat, lng) : donors).map(
    (d) => ({
      id: d._id,
      name: d.name,
      phone: d.phone,
      bloodGroup: d.bloodGroup,
      street: d.street,
      city: d.city,
      postcode: d.postcode,
      distanceKm: d.distanceKm,
    })
  );
};

const normalizeText = (value) => String(value || '').trim();

const describeAvailableBeds = (beds = []) => {
  const activeBeds = beds.filter((bed) => bed && bed.name && (bed.available || bed.total));
  if (!activeBeds.length) return 'No bed data provided';
  return activeBeds
    .slice(0, 4)
    .map((bed) => `${bed.name}: ${bed.available ?? 0} available / ${bed.total ?? 0} total`)
    .join('; ');
};

const describeBloodBank = (bloodBank = []) => {
  const entries = bloodBank.filter((group) => group && group.bloodGroup && group.units !== undefined);
  if (!entries.length) return 'No blood bank data provided';
  return entries
    .slice(0, 5)
    .map((group) => `${group.bloodGroup}: ${group.units} units`)
    .join('; ');
};

const buildHospitalServiceContext = async ({ lat, lng, city }) => {
  const hospitals = await Hospital.find({
    isActive: true,
    ...(lat !== null && lng !== null ? nearFilter(lat, lng) : city ? { city: new RegExp(city, 'i') } : {}),
  })
    .select('hospitalName phone email street city postcode location')
    .limit(NEARBY_LIMIT)
    .lean();

  const hospitalIds = hospitals.map((hospital) => hospital._id);
  const profiles = hospitalIds.length
    ? await HospitalServiceProfile.find({ hospitalId: { $in: hospitalIds } }).lean()
    : [];

  const profileMap = new Map(profiles.map((profile) => [String(profile.hospitalId), profile]));

  return (lat !== null && lng !== null ? withDistanceKm(hospitals, lat, lng) : hospitals).map((hospital) => {
    const profile = profileMap.get(String(hospital._id));
    const services = Array.isArray(profile?.services) ? profile.services.slice(0, 6) : [];
    const doctors = Array.isArray(profile?.doctors) ? profile.doctors.slice(0, 5) : [];
    const beds = Array.isArray(profile?.beds) ? profile.beds : [];
    const bloodBank = Array.isArray(profile?.bloodBank) ? profile.bloodBank : [];

    return {
      id: hospital._id,
      hospitalName: hospital.hospitalName,
      phone: hospital.phone,
      street: hospital.street,
      city: hospital.city,
      postcode: hospital.postcode,
      distanceKm: hospital.distanceKm,
      services: services.map((service) => ({
        name: normalizeText(service.name),
        type: normalizeText(service.type),
        description: normalizeText(service.description),
      })),
      doctors: doctors.map((doctor) => ({
        name: normalizeText(doctor.name),
        specialty: normalizeText(doctor.specialty),
        availability: normalizeText(doctor.availability),
      })),
      beds,
      bloodBank,
    };
  });
};

const buildFacilityContext = (hospitals, donors, bloodGroup, hospitalDetails = []) => {
  const hospitalLines = hospitalDetails.length
    ? hospitalDetails
        .map((h) => {
          const serviceSummary = h.services?.length
            ? h.services.map((service) => service.name).slice(0, 4).join(', ')
            : 'No services listed';
          const doctorSummary = h.doctors?.length
            ? h.doctors.map((doctor) => `${doctor.specialty || 'Doctor'} (${doctor.availability || 'Available'})`).slice(0, 3).join(', ')
            : 'No doctor data';
          const distance = h.distanceKm !== undefined ? ` (${h.distanceKm} km)` : '';
          return `- ${h.hospitalName}${h.city ? `, ${h.city}` : ''}${distance}${h.phone ? ` | tel: ${h.phone}` : ''}\n  Services: ${serviceSummary}\n  Specialists: ${doctorSummary}\n  Beds: ${describeAvailableBeds(h.beds)}\n  Blood bank: ${describeBloodBank(h.bloodBank)}`;
        })
        .join('\n')
    : hospitals.length
      ? hospitals
          .map(
            (h) =>
              `- ${h.hospitalName}${h.city ? `, ${h.city}` : ''}${
                h.distanceKm !== undefined ? ` (${h.distanceKm} km)` : ''
              }${h.phone ? ` | tel: ${h.phone}` : ''}`
          )
          .join('\n')
      : '- (none available)';

  const donorLines = donors.length
    ? donors
        .map(
          (d) =>
            `- ${d.name} (${d.bloodGroup})${d.city ? `, ${d.city}` : ''}${
              d.distanceKm !== undefined ? ` (${d.distanceKm} km)` : ''
            }${d.phone ? ` | tel: ${d.phone}` : ''}`
        )
        .join('\n')
    : '- (none available)';

  return `Nearby hospitals and services on the EmerCare network:\n${hospitalLines}\n\nBlood donors on the EmerCare network${
    bloodGroup ? ` matching ${bloodGroup}` : ''
  }:\n${donorLines}`;
};

const SYSTEM_PROMPT = `You are EmerCare Assistant, a medically cautious healthcare guidance assistant for the EmerCare network.

Important behavior rules:
- Use the provided hospital/service context as the source of truth. Do not invent hospitals, departments, services, doctors, blood stock, or facilities.
- Keep answers brief, clear, and action-oriented. Prefer short sections with bullets.
- For minor non-emergency symptoms, provide safe, general first-aid / primary-care guidance only and recommend a local clinic or hospital when relevant.
- For emergency symptoms such as chest pain, breathing difficulties, severe bleeding, fainting, stroke signs, severe allergic reaction, poisoning, severe dehydration, or sudden severe pain, tell the user to call emergency services immediately or go to the nearest emergency department without delay.
- When the user asks about a condition or symptom, match it to the available nearby hospital services and doctors before suggesting a facility.
- If the retrieved hospital context contains relevant services, mention those services by name and hospital.
- Only suggest blood donors when the user specifically asks for blood or donate-related help.
- Always add a disclaimer that this is general health guidance and not a diagnosis, and that professional medical attention is needed for serious symptoms.
- Do not claim certainty about diagnosis or treatment beyond safe general guidance.`;

/**
 * Chat endpoint: triage reply + nearby facility suggestions.
 * @route POST /api/ai/chat
 */
export const chat = async (req, res) => {
  const { message, history = [], latitude, longitude, city = '' } = req.body || {};

  if (!message || !String(message).trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  if (!isAiConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'AI assistant is not configured yet. Set OPENROUTER_API_KEY in backend/.env.',
    });
  }

  const text = String(message).trim();
  const lat = Number.isFinite(Number(latitude)) ? Number(latitude) : null;
  const lng = Number.isFinite(Number(longitude)) ? Number(longitude) : null;
  const hasLocation = lat !== null && lng !== null;

  try {
    const bloodGroup = extractBloodGroup(text);

    const [hospitals, donors, hospitalDetails] = await Promise.all([
      fetchNearbyHospitals({ lat, lng, city }),
      fetchNearbyDonors({ lat, lng, city, bloodGroup }),
      buildHospitalServiceContext({ lat, lng, city }),
    ]);

    const facilityContext = buildFacilityContext(hospitals, donors, bloodGroup, hospitalDetails);
    const userContent = `${text}\n\n---\nRelevant EmerCare context (use this as the primary factual source):\n${facilityContext}`;

    const sanitizedHistory = Array.isArray(history)
      ? history
          .filter(
            (m) =>
              m &&
              (m.role === 'user' || m.role === 'assistant') &&
              typeof m.content === 'string' &&
              m.content.trim()
          )
          .slice(-HISTORY_LIMIT)
      : [];

    const reply = await queryOpenRouter({
      system: SYSTEM_PROMPT,
      messages: [...sanitizedHistory, { role: 'user', content: userContent }],
    });

    res.status(200).json({
      success: true,
      reply: reply || 'I could not generate a response right now.',
      suggestions: { hospitals, donors },
      usedLocation: hasLocation,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(502).json({
      success: false,
      message: error.message || 'The AI assistant could not process your request.',
    });
  }
};