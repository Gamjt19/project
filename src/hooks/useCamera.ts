import { useState, useRef, useEffect, useCallback } from 'react';

export interface CameraState {
  isActive: boolean;
  isInitializing: boolean;
  error: string | null;
  stream: MediaStream | null;
}

export const useCamera = () => {
  const [state, setState] = useState<CameraState>({
    isActive: false,
    isInitializing: false,
    error: null,
    stream: null,
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async () => {
    setState(prev => ({ ...prev, isInitializing: true, error: null }));

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      // Request camera permissions first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 10 },
        },
        audio: false,
      });

      // Set the stream immediately
      setState(prev => ({
        ...prev,
        stream,
        isActive: true,
        isInitializing: false,
        error: null,
      }));

      // Set up video element after stream is obtained
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          const onLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            resolve(true);
          };

          const onError = (e: Event) => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Failed to load video stream'));
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);
          
          // Start playing
          video.play().catch(reject);
        });
      } else {
        // If video element is not available, we still have the stream
        // The video element will be set up when it becomes available
        console.log('Video element not available yet, stream obtained successfully');
      }

    } catch (error) {
      console.error('Camera access error:', error);
      
      let errorMessage = 'Camera access failed';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported in this browser.';
        } else {
          errorMessage = error.message;
        }
      }

      setState({
        isActive: false,
        isInitializing: false,
        error: errorMessage,
        stream: null,
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => {
        track.stop();
      });
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Reset video element
    }

    setState({
      isActive: false,
      isInitializing: false,
      error: null,
      stream: null,
    });
  }, [state.stream]);

  const toggleCamera = useCallback(() => {
    if (state.isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [state.isActive, startCamera, stopCamera]);

  // Set up video element when it becomes available and we have a stream
  useEffect(() => {
    if (videoRef.current && state.stream && state.isActive) {
      const video = videoRef.current;
      video.srcObject = state.stream;
      
      video.play().catch(error => {
        console.error('Failed to play video:', error);
      });
    }
  }, [videoRef.current, state.stream, state.isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [state.stream]);

  return {
    ...state,
    videoRef,
    startCamera,
    stopCamera,
    toggleCamera,
  };
};