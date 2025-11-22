# EmerCare

Emergency Healthcare Network Platform - Connecting patients with hospitals, blood donors, and ambulance services.

## Live Demo
🚀 [Frontend](#) | 🔌 [Backend API](#)

## Quick Links
- [Installation Guide](./README.md#installation--setup)
- [API Documentation](./README.md#api-endpoints)
- [Deployment Guide](./README.md#deployment)

## Tech Stack
**Backend**: Node.js, Express, MongoDB, Cloudinary  
**Frontend**: React, Vite, Axios, React Router

## Features
✨ GPS-based proximity search  
🏥 Hospital service management  
🩸 Blood donor network  
🚑 Ambulance tracking  
📍 Dual-mode address registration (Text/GPS)

## Getting Started

```bash
# Clone repository
git clone <your-repo-url>
cd EmerCare

# Backend setup
cd backend
npm install
cp .env.example .env
# Configure .env with your credentials
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit http://localhost:5173 to see the app!

## Environment Setup

**Backend** requires:
- MongoDB connection string
- Cloudinary credentials (cloud name, API key, API secret)

**Frontend** requires:
- Backend API URL

See [full documentation](./README.md) for detailed setup instructions.

## Contributing
Pull requests are welcome! Please read our contributing guidelines first.

## License
ISC License
