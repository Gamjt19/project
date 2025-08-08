import React, { useState } from 'react';
import { Camera, CameraOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';

export const CameraTest: React.FC = () => {
  const { isActive, isInitializing, error, videoRef, startCamera, stopCamera } = useCamera();
  const [testResults, setTestResults] = useState<string[]>([]);

  const runCameraTest = async () => {
    setTestResults([]);
    
    // Test 1: Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setTestResults(prev => [...prev, '❌ Camera API not supported']);
      return;
    }
    setTestResults(prev => [...prev, '✅ Camera API supported']);

    // Test 2: Check available devices
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setTestResults(prev => [...prev, `✅ Found ${videoDevices.length} camera(s)`]);
    } catch (err) {
      setTestResults(prev => [...prev, '❌ Could not enumerate devices']);
    }

    // Test 3: Try to start camera
    try {
      await startCamera();
      setTestResults(prev => [...prev, '✅ Camera started successfully']);
    } catch (err) {
      setTestResults(prev => [...prev, `❌ Failed to start camera: ${err}`]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Test</h3>
      
      <div className="space-y-4">
        {/* Camera Status */}
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            isActive ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm font-medium">
            {isActive ? 'Camera Active' : 'Camera Inactive'}
          </span>
          {isInitializing && (
            <span className="text-sm text-yellow-600">Initializing...</span>
          )}
        </div>

        {/* Test Results */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Test Results:</h4>
          {testResults.length === 0 ? (
            <p className="text-sm text-gray-500">No tests run yet</p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Camera Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Video Preview */}
        {isActive && (
          <div className="bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={runCameraTest}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run Camera Test
          </button>
          
          <button
            onClick={isActive ? stopCamera : startCamera}
            disabled={isInitializing}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            } ${isInitializing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isActive ? (
              <>
                <CameraOff className="w-4 h-4 inline mr-2" />
                Stop Camera
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 inline mr-2" />
                Start Camera
              </>
            )}
          </button>
        </div>

        {/* Browser Info */}
        <div className="text-xs text-gray-500">
          <p>Browser: {navigator.userAgent}</p>
          <p>User Media Supported: {navigator.mediaDevices ? 'Yes' : 'No'}</p>
          <p>HTTPS: {window.location.protocol === 'https:' ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};
