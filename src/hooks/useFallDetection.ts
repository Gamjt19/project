import { useState, useEffect, useCallback, useRef } from 'react';
import { fallDetectionService } from '../services/fallDetection';
import { Pose, FallDetectionResult } from '../types';

export interface FallDetectionState {
  isInitialized: boolean;
  isDetecting: boolean;
  currentPose: Pose | null;
  lastResult: FallDetectionResult | null;
  error: string | null;
}

export const useFallDetection = (videoElement: HTMLVideoElement | null) => {
  const [state, setState] = useState<FallDetectionState>({
    isInitialized: false,
    isDetecting: false,
    currentPose: null,
    lastResult: null,
    error: null,
  });

  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const onFallDetectedRef = useRef<((result: FallDetectionResult) => void) | null>(null);

  const initialize = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      await fallDetectionService.initialize();
      setState(prev => ({ ...prev, isInitialized: true }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize fall detection',
      }));
    }
  }, []);

  const startDetection = useCallback(() => {
    if (!state.isInitialized || !videoElement || state.isDetecting) {
      return;
    }

    setState(prev => ({ ...prev, isDetecting: true, error: null }));

    detectionIntervalRef.current = setInterval(async () => {
      try {
        const pose = await fallDetectionService.detectPose(videoElement);
        if (!pose) return;

        const result = fallDetectionService.detectFall(pose);

        setState(prev => ({
          ...prev,
          currentPose: pose,
          lastResult: result,
        }));

        // Trigger fall callback if fall detected
        if (result.hasFallen && onFallDetectedRef.current) {
          onFallDetectedRef.current(result);
        }
      } catch (error) {
        console.error('Detection error:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Detection failed',
        }));
      }
    }, 100); // 10 FPS detection rate
  }, [state.isInitialized, videoElement, state.isDetecting]);

  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isDetecting: false,
      currentPose: null,
      lastResult: null,
    }));

    fallDetectionService.reset();
  }, []);

  const setFallCallback = useCallback((callback: (result: FallDetectionResult) => void) => {
    onFallDetectedRef.current = callback;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    initialize,
    startDetection,
    stopDetection,
    setFallCallback,
  };
};