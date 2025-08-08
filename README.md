# CareLoop - Advanced AI-Powered Elder Fall Detection System

CareLoop is a cutting-edge, real-time elder fall detection web application that uses advanced computer vision and AI to monitor elders and detect falls, providing immediate alerts to caregivers and emergency contacts.

## 🚀 **Advanced Features**

### **AI-Powered Fall Detection**
- **Real-time Pose Estimation**: Uses TensorFlow.js and PoseNet for 17-point body tracking
- **Advanced Fall Detection Algorithm**: 7 different detection criteria for accurate fall detection
- **Pose State Analysis**: Distinguishes between standing, sitting, lying, and falling states
- **Motion Analysis**: Detects sudden movements and rapid position changes
- **Sleep vs Fall Differentiation**: Analyzes extended lying positions to differentiate from sleeping

### **Real-time Monitoring**
- **Live Video Feed**: Real-time webcam monitoring with privacy controls
- **Skeleton Overlay**: Visual pose tracking with color-coded body parts
- **Pose State Display**: Real-time status indicators (Standing, Sitting, Lying, Falling)
- **Sensitivity Controls**: Adjustable detection thresholds for optimal performance

### **Smart Alert System**
- **Web Notifications**: Browser-based notifications with action buttons
- **Real-time Alerts**: Immediate fall detection with visual and audible alerts
- **Emergency Contacts**: Simulated SMS/WhatsApp notifications to caregivers
- **Alert History**: Comprehensive logging and acknowledgment system

## 🎯 **Core Detection Logic**

### **7-Point Fall Detection System**
1. **Horizontal Body Position**: Detects when person is lying down
2. **Head Below Shoulders**: Identifies when head is below shoulder level
3. **Sudden Vertical Movement**: Detects rapid downward motion
4. **Rapid Movement Analysis**: Analyzes movement patterns over time
5. **Unusual Pose Detection**: Identifies abnormal body positions
6. **Ground Proximity**: Detects when person is near ground level
7. **Extended Lying Position**: Differentiates falls from sleeping

### **Pose State Classification**
- **Standing**: Upright position with confidence > 0.9
- **Sitting**: Seated position with body angle < 45°
- **Lying**: Horizontal position with body angle > 25°
- **Falling**: Rapid movement with sudden position changes

## 🛠 **Technical Stack**

- **Frontend**: React 18 + TypeScript
- **AI/ML**: TensorFlow.js + PoseNet
- **Computer Vision**: Real-time pose estimation
- **Notifications**: Web Notifications API
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## 📋 **Installation & Setup**

### **Prerequisites**
- Node.js (v16 or higher)
- Modern web browser with camera access
- HTTPS connection (required for camera access)

### **Quick Start**
```bash
# Clone the repository
git clone <repository-url>
cd careloop

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## 🎮 **How to Use**

### **1. Add Your First Elder**
1. Click "Add Elder" in the Overview tab
2. Fill in elder information (name, age, medical info)
3. Set activity level (low/medium/high)

### **2. Configure Emergency Contacts**
1. Select an elder from the overview
2. Add emergency contacts with:
   - Name and relationship
   - Phone number and email
   - Preferred notification method

### **3. Start Monitoring**
1. Go to "Live Monitoring" tab
2. Select an elder to monitor
3. Click "Start Camera" to begin AI monitoring
4. Watch real-time pose detection and fall alerts

### **4. Test Fall Detection**
- **Real Fall**: Simulate a fall by lying down
- **Test Button**: Click red "Test Fall" button for demo
- **Sensitivity**: Adjust detection settings in camera feed

## 🔧 **Advanced Configuration**

### **Sensitivity Settings**
- **Fall Threshold**: Number of consecutive frames for fall detection (1-5)
- **Confidence Threshold**: Minimum pose confidence (0.1-0.9)
- **Movement Sensitivity**: Vertical movement detection (30-120px)

### **Privacy Features**
- **Video Feed Toggle**: Hide/show camera feed for privacy
- **Local Storage**: All data stored locally in browser
- **No External APIs**: No video data transmitted to servers

## 📊 **Real-time Features**

### **Live Dashboard**
- **Total Elders**: Number of monitored elders
- **Active Alerts**: Current unacknowledged alerts
- **Alerts Today**: 24-hour alert statistics
- **System Uptime**: Continuous monitoring status

### **Alert Management**
- **Real-time Notifications**: Immediate browser notifications
- **Alert History**: Complete log of all alerts
- **Acknowledgment System**: Mark alerts as resolved
- **Emergency Contacts**: Simulated notifications to caregivers

## 🎯 **Demo Instructions**

### **3-Minute Demo Flow**
1. **Setup (30s)**: Add an elder and start camera
2. **Live Monitoring (1m)**: Show real-time pose detection
3. **Fall Detection (1m)**: Demonstrate fall detection with test button
4. **Alert System (30s)**: Show notification and alert history

### **Testing Scenarios**
- **Standing to Lying**: Simulate a fall by lying down
- **Sudden Movement**: Rapid position changes
- **Extended Lying**: Differentiate from sleeping
- **False Positive**: Test sensitivity settings

## 🔒 **Security & Privacy**

- **Local Processing**: All AI processing done client-side
- **No Video Storage**: No video data stored or transmitted
- **Browser Permissions**: Camera access requires user consent
- **HTTPS Required**: Secure connection for camera access

## 🚀 **Performance Optimizations**

- **Efficient AI Model**: Optimized PoseNet for real-time processing
- **Frame Rate Control**: 10 FPS detection for smooth performance
- **Memory Management**: Automatic cleanup of pose history
- **CPU Optimization**: Reduced processing load for better performance

## 📱 **Browser Compatibility**

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

## 🛠 **Development**

### **Project Structure**
```
src/
├── components/          # React components
│   ├── CameraFeed.tsx  # Main camera interface
│   ├── Dashboard.tsx   # Main dashboard
│   └── CameraTest.tsx  # Camera testing utility
├── services/           # Business logic
│   ├── fallDetection.ts # AI fall detection
│   └── alertService.ts # Alert management
├── hooks/              # Custom React hooks
│   ├── useCamera.ts    # Camera management
│   └── useFallDetection.ts # Fall detection hook
└── types/              # TypeScript definitions
```

### **Key Technologies**
- **TensorFlow.js**: AI/ML framework
- **PoseNet**: Real-time pose estimation
- **Web Notifications**: Browser notifications
- **React Hooks**: State management
- **TypeScript**: Type safety

## 🎯 **MVP Goals Achieved**

✅ **Real-time Fall Detection**: Advanced AI-powered detection  
✅ **Web Notifications**: Immediate browser alerts  
✅ **Skeleton Overlay**: Visual pose tracking  
✅ **Sensitivity Controls**: Adjustable detection parameters  
✅ **Mobile Responsive**: Works on all devices  
✅ **3-Minute Demo**: Ready for hackathon presentation  

## 📞 **Support**

For technical support or questions, please open an issue in the repository.

---

**CareLoop** - Protecting elders with advanced AI technology 🚀
