# CareLoop - Elder Fall Detection System

CareLoop is a real-time elder fall detection web application that uses computer vision and AI to monitor elders and detect falls, providing immediate alerts to caregivers and emergency contacts.

## Features

- **Real-time Fall Detection**: Uses TensorFlow.js and PoseNet to detect falls in real-time
- **Elder Management**: Add and manage multiple elders with their medical information
- **Emergency Contacts**: Configure emergency contacts for each elder with preferred notification methods
- **Live Monitoring**: Real-time camera feed with AI-powered pose detection
- **Alert System**: Immediate notifications when falls are detected
- **Dashboard**: Comprehensive overview with statistics and recent activity

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Modern web browser with camera access
- HTTPS connection (required for camera access)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd careloop
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## How to Use

### 1. Add Your First Elder

1. Click on the "Add Elder" button in the Overview tab
2. Fill in the elder's information:
   - Name
   - Age
   - Medical information (optional)
   - Activity level
3. Click "Add Elder" to save

### 2. Configure Emergency Contacts

1. Select an elder from the overview
2. Add emergency contacts with their:
   - Name and relationship
   - Phone number
   - Email address
   - Preferred notification method (SMS or WhatsApp)

### 3. Start Monitoring

1. Go to the "Live Monitoring" tab
2. Select an elder to monitor
3. Click "Start Camera" to begin monitoring
4. The AI will automatically detect falls and send alerts

### 4. View Alerts

- Check the "Alert History" tab to see all alerts
- Acknowledge alerts to mark them as resolved
- View fall detection confidence levels

## Technical Details

### Fall Detection Algorithm

The system uses PoseNet to detect 17 key body points and analyzes:
- Body orientation and position
- Sudden vertical movements
- Head position relative to shoulders
- Consecutive frame analysis for accuracy

### Alert System

When a fall is detected:
1. Immediate alert is generated
2. Emergency contacts are notified via their preferred method
3. Alert is stored with timestamp and snapshot
4. Dashboard statistics are updated

### Privacy Features

- Video feed can be hidden for privacy
- Local storage for elder data
- No video data is transmitted to external servers
- Camera access can be toggled on/off

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Security Notes

- Camera access requires HTTPS in production
- All data is stored locally in the browser
- No external API calls for data storage
- Emergency notifications are simulated (configure real SMS/WhatsApp APIs for production)

## Development

### Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # Business logic services
├── types/              # TypeScript type definitions
└── main.tsx           # App entry point
```

### Key Technologies

- React 18 with TypeScript
- TensorFlow.js for AI
- PoseNet for pose detection
- Tailwind CSS for styling
- Vite for build tooling

## License

This project is licensed under the MIT License.

## Support

For technical support or questions, please open an issue in the repository.
