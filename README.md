# EmerCare - Emergency Healthcare Network Platform

A healthcare coordination platform connecting patients with hospitals, blood donors, and ambulance services in emergency situations. Features GPS-based proximity search, dual-mode address registration, and real-time service availability tracking.

## 🎯 Core Purpose of EmerCare
EmerCare is designed to assist people during emergencies by providing **all critical healthcare information in one place**.  
Users can instantly find:

- Nearby **hospitals** with real-time availability (beds, doctors, blood bank)
- **Ambulance services** with live availability and contact options
- **Blood donors** filtered by blood group and location

The platform ensures that in urgent situations, users can **quickly locate help and directly contact the right service** without wasting time searching across different platforms.

## 🚀 Features

- **System Accounts: Hospitals, Blood Donors, and Ambulance Services
- **General Users: Can search nearby hospitals, donors, and ambulance services during emergencies without needing an account
- **Smart Registration**: Text-based or GPS location capture
- **"Near Me" Search**: Find closest services using geolocation within 50km radius
- **Service Management**: Manage doctors, vehicles, bed capacity, and blood bank inventory
- **Secure Authentication**: Password hashing with PBKDF2
- **Cloud Storage**: Image/document uploads via Cloudinary
- **Geospatial Search**: MongoDB geospatial queries with GeoJSON

## 📁 Project Structure

```
EmerCare/
├── backend/          # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoints
│   │   └── utils/        # Helper functions
│   ├── .env.example
│   └── package.json
│
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API calls
│   │   ├── utils/        # Helper functions
│   │   └── styles/       # CSS files
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## 🛠️ Tech Stack

**Backend:**
- Node.js v22+
- Express 5.1.0
- MongoDB (Mongoose 8.19.3)
- Cloudinary (image storage)
- PBKDF2 (password hashing)

**Frontend:**
- React 19.1.1
- Vite 7.1.7
- React Router 7.9.5
- Axios (HTTP client)
- Browser Geolocation API

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for file uploads)

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd EmerCare
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file from example:
```bash
cp .env.example .env
```

Update `backend/.env` with your credentials:
```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/emercare

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:
```bash
npm run dev
# or for production
npm start
```

Backend will run on: http://localhost:5000

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file from example:
```bash
cp .env.example .env
```

Update `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

Frontend will run on: http://localhost:5173

## 🔌 API Endpoints

### Donors
- `POST /api/donors/register` - Register new donor
- `GET /api/donors` - Get all donors (with filters)
- `POST /api/donors/login` - Donor login

### Hospitals
- `POST /api/hospitals/register` - Register new hospital
- `GET /api/hospitals` - Get all hospitals (with filters)
- `POST /api/hospitals/login` - Hospital login

### Ambulances
- `POST /api/ambulances/register` - Register ambulance service
- `GET /api/ambulances` - Get all ambulances (with filters)
- `POST /api/ambulances/login` - Ambulance login

### Hospital Services
- `GET /api/hospital-services/:id` - Get hospital services
- `POST /api/hospital-services/:id/doctors` - Add doctor
- `PUT /api/hospital-services/:id/beds` - Update bed capacity
- `PUT /api/hospital-services/:id/blood-bank` - Update blood bank

**Query Parameters for Search:**
- `city`, `postcode`, `street` - Text-based search
- `latitude`, `longitude`, `maxDistance` - GPS proximity search
- `bloodGroup` - Filter donors by blood group

## 🗺️ Geolocation Features

**Registration:**
- Users can choose text address OR GPS location
- GPS coordinates stored as GeoJSON Point

**Search:**
- "Near Me" button captures user's GPS location
- Searches within 50km radius by default
- Results sorted by distance
- Distance displayed in km/meters

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=<your_mongodb_connection_string>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Deployment

### Backend (Render/Railway/Heroku)
1. Set environment variables in hosting platform
2. Ensure MongoDB Atlas connection string is configured
3. Deploy from GitHub repository

### Frontend (Vercel)
1. Set `VITE_API_URL` to your deployed backend URL
2. Deploy from GitHub repository
3. Vercel will automatically detect Vite and build

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

-Wahid Mubarrat Bin Azhar

## ⚠️ Important Notes

- **Security**: Never commit `.env` files with real credentials
- **GPS Location**: HTTPS required in production for browser geolocation
- **MongoDB**: Create 2dsphere indexes for geospatial queries
- **Cloudinary**: Free tier has upload limits
- **CORS**: Configure allowed origins for production

## 🐛 Troubleshooting

**Backend won't start:**
- Check MongoDB connection string
- Verify Cloudinary credentials
- Ensure PORT is not in use

**Frontend can't connect to backend:**
- Verify `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend
- Ensure backend is running

**GPS search not working:**
- Browser must support geolocation
- User must grant location permission
- Records must have GPS coordinates in database

## 📞 Support

For issues and questions, please open a GitHub issue.

---

**Disclaimer**: This platform is for informational purposes only and is not a substitute for professional medical advice.
