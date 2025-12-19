# Deployment Guide

This guide will help you deploy the EmerCare application to Vercel (frontend) and Render (backend).

## Prerequisites

1. GitHub account with the codebase pushed to a repository
2. Vercel account (free tier available)
3. Render account (free tier available)
4. MongoDB Atlas account (or other MongoDB provider)
5. Cloudinary account (for image uploads)

## Backend Deployment (Render)

### Step 1: Prepare Environment Variables

Before deploying, gather the following:
- MongoDB connection string
- Cloudinary credentials (cloud name, API key, API secret)
- Frontend URL (will be available after frontend deployment)

### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `emercare-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
6. Click "Create Web Service"
7. Wait for deployment to complete
8. Copy the service URL (e.g., `https://emercare-backend.onrender.com`)

### Step 3: Update Health Check

The backend includes a health check endpoint at `/health` which Render will use automatically.

## Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
   (Use the Render backend URL from Step 2)
6. Click "Deploy"
7. Wait for deployment to complete
8. Copy the deployment URL (e.g., `https://emercare.vercel.app`)

### Step 2: Update Backend CORS

After getting your Vercel frontend URL, update the backend environment variable in Render:
1. Go to Render dashboard → Your backend service → Environment
2. Update `FRONTEND_URL` with your Vercel URL
3. Redeploy the backend service

Alternatively, you can update the CORS configuration in `backend/src/index.js` to include your specific Vercel URL.

## Post-Deployment Checklist

- [ ] Backend is accessible at Render URL
- [ ] Frontend is accessible at Vercel URL
- [ ] Frontend can communicate with backend (check browser console)
- [ ] Health check endpoint works: `https://your-backend.onrender.com/health`
- [ ] API endpoints are accessible
- [ ] Image uploads work (Cloudinary configured)
- [ ] Database connections work (MongoDB configured)

## Troubleshooting

### Backend Issues

1. **Connection Timeout**: Check MongoDB Atlas network access settings
2. **CORS Errors**: Verify `FRONTEND_URL` is set correctly in Render
3. **Build Failures**: Check Node.js version compatibility (requires Node >= 16)

### Frontend Issues

1. **API Connection Errors**: Verify `VITE_API_URL` is set correctly in Vercel
2. **Build Failures**: Check that all dependencies are in `package.json`
3. **Routing Issues**: Verify `vercel.json` is in the frontend directory

## Environment Variables Reference

### Backend (Render)
- `NODE_ENV`: `production`
- `PORT`: Auto-set by Render
- `MONGODB_URI`: Your MongoDB connection string
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `FRONTEND_URL`: Your Vercel frontend URL

### Frontend (Vercel)
- `VITE_API_URL`: Your Render backend URL

## Notes

- Render free tier services spin down after 15 minutes of inactivity. First request may be slow.
- Vercel provides automatic HTTPS and CDN
- Both platforms support automatic deployments from GitHub
- Update environment variables as needed without redeploying code

