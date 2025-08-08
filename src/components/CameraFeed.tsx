import React, { useEffect, useState } from 'react';
import { Camera, CameraOff, Eye, EyeOff, AlertTriangle, RefreshCw, TestTube } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { useFallDetection } from '../hooks/useFallDetection';
import { FallDetectionResult, Elder } from '../types';
import { alertService } from '../services/alertService';

interface CameraFeedProps {
  onFallDetected?: (result: FallDetectionResult) => void;
  showPoseOverlay?: boolean;
  className?: string;
  elder?: Elder;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  onFallDetected,
  showPoseOverlay = true,
  className = '',
  elder,
}) => {
  const { isActive, isInitializing, error, videoRef, startCamera, stopCamera, toggleCamera } = useCamera();
  const [showVideoFeed, setShowVideoFeed] = useState(true);
  const [isDetectionActive, setIsDetectionActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const fallDetection = useFallDetection(videoRef.current);

  // Initialize fall detection when component mounts
  useEffect(() => {
    fallDetection.initialize();
  }, []);

  // Set fall callback
  useEffect(() => {
    if (onFallDetected) {
      fallDetection.setFallCallback(onFallDetected);
    }
  }, [onFallDetected, fallDetection]);

  // Start/stop detection based on camera state
  useEffect(() => {
    if (isActive && fallDetection.isInitialized && !isDetectionActive && videoReady) {
      fallDetection.startDetection();
      setIsDetectionActive(true);
    } else if ((!isActive || !videoReady) && isDetectionActive) {
      fallDetection.stopDetection();
      setIsDetectionActive(false);
    }
  }, [isActive, fallDetection.isInitialized, isDetectionActive, fallDetection, videoReady]);

  // Handle video ready state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoReady(true);
    };

    const handleCanPlay = () => {
      setVideoReady(true);
    };

    const handleError = () => {
      setVideoReady(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const drawPoseOverlay = () => {
    if (!showPoseOverlay || !fallDetection.currentPose || !videoRef.current) {
      return null;
    }

    const pose = fallDetection.currentPose;
    const videoRect = videoRef.current.getBoundingClientRect();

    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${videoRect.width} ${videoRect.height}`}
      >
        {/* Draw keypoints */}
        {pose.keypoints.map((keypoint, index) => {
          if (keypoint.score > 0.3) {
            return (
              <circle
                key={index}
                cx={keypoint.x}
                cy={keypoint.y}
                r="4"
                fill="#10B981"
                stroke="#ffffff"
                strokeWidth="2"
              />
            );
          }
          return null;
        })}
        
        {/* Draw connections between keypoints */}
        {/* Simplified skeleton connections */}
        <g stroke="#10B981" strokeWidth="2" fill="none">
          {/* Torso */}
          {pose.keypoints[5]?.score > 0.3 && pose.keypoints[6]?.score > 0.3 && (
            <line
              x1={pose.keypoints[5].x}
              y1={pose.keypoints[5].y}
              x2={pose.keypoints[6].x}
              y2={pose.keypoints[6].y}
            />
          )}
          {/* Body center line */}
          {pose.keypoints[5]?.score > 0.3 && pose.keypoints[11]?.score > 0.3 && (
            <line
              x1={pose.keypoints[5].x}
              y1={pose.keypoints[5].y}
              x2={pose.keypoints[11].x}
              y2={pose.keypoints[11].y}
            />
          )}
        </g>
      </svg>
    );
  };

  const handleRetryCamera = () => {
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const handleTestFall = async () => {
    if (elder) {
      await alertService.triggerTestFall(elder);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {isActive ? 'Live Camera Feed' : 'Camera Inactive'}
              </h3>
              {elder && (
                <p className="text-xs text-gray-500">Monitoring: {elder.name}</p>
              )}
            </div>
            {fallDetection.isDetecting && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                AI Monitoring
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowVideoFeed(!showVideoFeed)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={showVideoFeed ? 'Hide video feed' : 'Show video feed'}
            >
              {showVideoFeed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            
            <button
              onClick={toggleCamera}
              disabled={isInitializing}
              className={`p-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
              } ${isInitializing ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isActive ? 'Stop camera' : 'Start camera'}
            >
              {isActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Video Feed */}
      <div className="relative bg-black aspect-video">
        {showVideoFeed && isActive ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              onLoadedMetadata={() => setVideoReady(true)}
              onCanPlay={() => setVideoReady(true)}
              onError={() => setVideoReady(false)}
            />
            {drawPoseOverlay()}
            
            {/* Video ready indicator */}
            {!videoReady && (
              <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                Loading video...
              </div>
            )}

            {/* Test Fall Button */}
            {elder && (
              <button
                onClick={handleTestFall}
                className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors flex items-center space-x-1"
                title="Test Fall Detection"
              >
                <TestTube className="w-3 h-3" />
                <span>Test Fall</span>
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              {!showVideoFeed ? (
                <>
                  <EyeOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Video feed hidden for privacy</p>
                </>
              ) : !isActive ? (
                <>
                  <CameraOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Camera is not active</p>
                  <button
                    onClick={startCamera}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Camera
                  </button>
                </>
              ) : isInitializing ? (
                <>
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50 animate-pulse" />
                  <p className="text-sm">Initializing camera...</p>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {fallDetection.isInitialized ? (
              <span className="text-green-600">✓ AI Ready</span>
            ) : (
              <span className="text-gray-500">⚬ AI Loading</span>
            )}
            
            {isActive && (
              <span className={`font-medium ${videoReady ? 'text-green-600' : 'text-yellow-600'}`}>
                {videoReady ? 'Video Ready' : 'Video Loading'}
              </span>
            )}
            
            {fallDetection.lastResult && (
              <span className={`font-medium ${
                fallDetection.lastResult.hasFallen 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`}>
                {fallDetection.lastResult.hasFallen ? 'FALL DETECTED' : 'Normal Activity'}
              </span>
            )}
          </div>
          
          {fallDetection.lastResult && (
            <span className="text-gray-500">
              Confidence: {Math.round(fallDetection.lastResult.confidence * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Error Display */}
      {(error || fallDetection.error) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-2" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">Camera Error</h4>
              <p className="text-sm text-red-700 mt-1">
                {error || fallDetection.error}
              </p>
              <button
                onClick={handleRetryCamera}
                className="mt-2 flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Camera</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};