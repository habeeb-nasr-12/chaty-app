# Chat App - Full Stack MERN Application

A real-time chat application built with React, Node.js, Express, MongoDB, and Socket.IO.

## Features

- Real-time messaging with Socket.IO
- User authentication with JWT
- File/image sharing with Cloudinary
- Online user status
- Responsive design with Tailwind CSS and DaisyUI
- Multiple theme support

## Deployment

### For Render.com:

1. **Environment Variables** - Set these in your Render dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

2. **Build Command**: 
   ```
   npm run build
   ```

3. **Start Command**:
   ```
   npm start
   ```

4. **Root Directory**: 
   ```
   .
   ```

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```

3. Set up environment variables in `backend/.env`

4. Run development servers:
   ```bash
   # Backend (from root)
   npm run dev --prefix backend
   
   # Frontend (from root)  
   npm run dev --prefix frontend
   ```

## Project Structure

```
chatapp/
├── backend/          # Express.js API server
├── frontend/         # React.js client
├── package.json      # Root package.json for deployment
└── README.md
```

## Build Process

The build process:
1. Installs backend dependencies
2. Installs frontend dependencies  
3. Builds the React frontend
4. Copies the built frontend to `backend/dist`
5. The backend serves the frontend in production

## Troubleshooting

- Ensure all environment variables are set correctly
- Check that MongoDB connection string is valid
- Verify Cloudinary credentials
- Make sure Node.js version is 16 or higher 