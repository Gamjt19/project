# Project Documentation

## Tech Stack

### Frontend
- **React**: UI library for building interactive user interfaces
- **TypeScript**: Type-safe JavaScript for scalable development
- **Tailwind CSS**: Utility-first CSS framework for rapid UI styling
- **Vite**: Fast build tool and development server

### Backend
- **Python**: Main programming language for backend logic
- **Flask**: Lightweight web framework for serving API endpoints and video stream
- **Flask-CORS**: Handles cross-origin requests between frontend and backend
- **OpenCV**: Real-time computer vision library for camera access and image processing
- **MediaPipe**: ML framework for pose detection and fall detection logic
- **Winsound**: (Windows only) For audible alerts on fall detection

### Other
- **npm**: Package manager for frontend dependencies
- **Jupyter Notebook**: (optional) For prototyping and data analysis

## Features
- Real-time camera feed displayed in the React frontend
- AI-based fall detection using pose estimation
- Visual and audible alerts when a fall is detected
- REST API endpoints for camera feed and fall status
- User can acknowledge alerts in the frontend

## Future Scope
- **Multi-camera support**: Add ability to monitor multiple cameras/rooms
- **Cloud Integration**: Store alerts and video data in the cloud for remote monitoring
- **SMS/Email Notifications**: Send alerts to caregivers via SMS or email
- **Mobile App**: Develop a mobile version for on-the-go monitoring
- **Advanced Analytics**: Track activity, generate reports, and visualize elder movement patterns
- **User Management**: Add authentication and roles for multiple caregivers
- **Hardware Integration**: Support for IoT devices, wearables, or smart home systems
- **Localization**: Multi-language support for global deployment
- **Accessibility Improvements**: Enhanced UI for visually/hearing impaired users

## How to Run
1. Start the Flask backend: `python fall.py`
2. Start the React frontend: `npm run dev`
3. Open the frontend in your browser and monitor the camera feed and alerts

---
For more details, see the code comments and README.md.
