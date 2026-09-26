import Hospital from '../models/Hospital.js';
import Donor from '../models/Donor.js';
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

const buildFacilityContext = (hospitals, donors, bloodGroup) => {
  const hospitalLines = hospitals.length
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

  return `Nearby hospitals on the EmerCare network:\n${hospitalLines}\n\nBlood donors on the EmerCare network${
    bloodGroup ? ` matching ${bloodGroup}` : ''
  }:\n${donorLines}`;
};

const SYSTEM_PROMPT = `You are EmerCare Assistant, a friendly emergency first-aid and healthcare triage companion for the EmerCare network.

Your job:
- Answer the user's health questions and give clear, safe PRIMARY TREATMENT / first-aid suggestions for minor and non-critical situations (e.g., cuts, burns, fever, headache, sprains, allergic reactions).
- For potentially life-threatening symptoms (chest pain, difficulty breathing, severe or uncontrolled bleeding, unconsciousness, stroke signs, sudden severe pain, poisoning), clearly instruct the user to call emergency services or visit the nearest emergency room immediately, and give only safe interim first-aid steps.
- Keep answers concise (under ~200 words). Use short sections and bullet points when helpful.
- You will be given a list of nearby hospitals and blood donors from the EmerCare network. Refer to them only when relevant to the user's situation, by name and city. NEVER invent facilities that are not listed.
- Only suggest blood donors when the user mentions needing blood or a donation.
- Always end with a one-line reminder that you are not a substitute for professional medical advice or emergency services.`;

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

    const [hospitals, donors] = await Promise.all([
      fetchNearbyHospitals({ lat, lng, city }),
      fetchNearbyDonors({ lat, lng, city, bloodGroup }),
    ]);

    const facilityContext = buildFacilityContext(hospitals, donors, bloodGroup);
    const userContent = `${text}\n\n---\nReference facilities (use only when relevant):\n${facilityContext}`;

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