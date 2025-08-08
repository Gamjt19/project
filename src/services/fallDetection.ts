import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
import { PoseKeypoint, Pose, FallDetectionResult } from '../types';

export interface PoseState {
  standing: boolean;
  sitting: boolean;
  lying: boolean;
  falling: boolean;
  confidence: number;
  lastUpdate: Date;
}

export class FallDetectionService {
  private model: posenet.PoseNet | null = null;
  private isInitialized = false;
  private lastPoses: Pose[] = [];
  private consecutiveFallFrames = 0;
  private consecutiveLyingFrames = 0;
  private lastPoseState: PoseState = {
    standing: false,
    sitting: false,
    lying: false,
    falling: false,
    confidence: 0,
    lastUpdate: new Date(),
  };

  // Configurable thresholds
  private FALL_THRESHOLD = 2; // consecutive frames for fall detection
  private LYING_THRESHOLD = 3; // consecutive frames for lying detection
  private CONFIDENCE_THRESHOLD = 0.4; // reduced for better detection
  private MIN_POSE_SCORE = 0.2; // minimum score for individual keypoints
  private FALL_ANGLE_THRESHOLD = 25; // degrees for horizontal detection
  private VERTICAL_MOVEMENT_THRESHOLD = 60; // pixels for sudden drop
  private RAPID_MOVEMENT_THRESHOLD = 25; // average movement threshold

  async initialize(): Promise<void> {
    try {
      // Ensure TensorFlow.js backend is ready
      await tf.ready();
      
      // Load PoseNet model with optimized settings
      this.model = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75,
      });
      this.isInitialized = true;
      console.log('🚀 Advanced fall detection model initialized');
    } catch (error) {
      console.error('Failed to initialize fall detection:', error);
      throw error;
    }
  }

  async detectPose(videoElement: HTMLVideoElement): Promise<Pose | null> {
    if (!this.model || !this.isInitialized) {
      throw new Error('Model not initialized');
    }

    try {
      const pose = await this.model.estimateSinglePose(videoElement, {
        flipHorizontal: false,
      });

      return {
        keypoints: pose.keypoints.map(kp => ({
          x: kp.position.x,
          y: kp.position.y,
          score: kp.score,
        })),
        score: pose.score,
      };
    } catch (error) {
      console.error('Pose detection error:', error);
      return null;
    }
  }

  detectFall(pose: Pose): FallDetectionResult {
    if (pose.score < this.CONFIDENCE_THRESHOLD) {
      return {
        hasFallen: false,
        confidence: 0,
        reason: 'Low pose confidence',
        pose,
        poseState: this.lastPoseState,
      };
    }

    // Get key body parts
    const keypoints = pose.keypoints;
    const nose = keypoints[0];
    const leftEye = keypoints[1];
    const rightEye = keypoints[2];
    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const leftElbow = keypoints[7];
    const rightElbow = keypoints[8];
    const leftWrist = keypoints[9];
    const rightWrist = keypoints[10];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];
    const leftKnee = keypoints[13];
    const rightKnee = keypoints[14];
    const leftAnkle = keypoints[15];
    const rightAnkle = keypoints[16];

    // Calculate body orientation and position
    const shoulderMidpoint = this.calculateMidpoint(leftShoulder, rightShoulder);
    const hipMidpoint = this.calculateMidpoint(leftHip, rightHip);
    const headMidpoint = this.calculateMidpoint(leftEye, rightEye);

    // Advanced pose analysis
    const poseAnalysis = this.analyzePose(pose);
    const motionAnalysis = this.analyzeMotion(pose);
    const positionAnalysis = this.analyzePosition(pose);

    // Determine current pose state
    const currentPoseState = this.determinePoseState(poseAnalysis, motionAnalysis, positionAnalysis);

    // Update pose state
    this.lastPoseState = {
      ...currentPoseState,
      lastUpdate: new Date(),
    };

    // Fall detection logic
    let fallConfidence = 0;
    let reasons: string[] = [];

    // 1. Check for lying position (horizontal body)
    if (poseAnalysis.isHorizontal) {
      fallConfidence += 0.3;
      reasons.push('horizontal body position');
    }

    // 2. Check for head below shoulders
    if (poseAnalysis.headBelowShoulders) {
      fallConfidence += 0.25;
      reasons.push('head below shoulders');
    }

    // 3. Check for sudden vertical movement (falling motion)
    if (motionAnalysis.hasSuddenDrop) {
      fallConfidence += 0.4;
      reasons.push('sudden vertical movement');
    }

    // 4. Check for rapid movement (falling dynamics)
    if (motionAnalysis.hasRapidMovement) {
      fallConfidence += 0.35;
      reasons.push('rapid movement detected');
    }

    // 5. Check for unusual pose (falling position)
    if (poseAnalysis.hasUnusualPose) {
      fallConfidence += 0.2;
      reasons.push('unusual body position');
    }

    // 6. Check for ground proximity
    if (positionAnalysis.isNearGround) {
      fallConfidence += 0.15;
      reasons.push('near ground level');
    }

    // 7. Check for extended lying position (differentiate from sleeping)
    if (currentPoseState.lying && this.consecutiveLyingFrames > this.LYING_THRESHOLD) {
      fallConfidence += 0.2;
      reasons.push('extended lying position');
    }

    // Store pose history for analysis
    this.lastPoses.push(pose);
    if (this.lastPoses.length > 20) { // Increased history for better analysis
      this.lastPoses.shift();
    }

    // Update consecutive frame counters
    if (currentPoseState.lying) {
      this.consecutiveLyingFrames++;
    } else {
      this.consecutiveLyingFrames = 0;
    }

    // Determine if fall has occurred
    const hasFallen = fallConfidence > 0.5; // Lower threshold for faster detection

    if (hasFallen) {
      this.consecutiveFallFrames++;
    } else {
      this.consecutiveFallFrames = 0;
    }

    return {
      hasFallen: this.consecutiveFallFrames >= this.FALL_THRESHOLD,
      confidence: fallConfidence,
      reason: reasons.join(', ') || 'normal posture',
      pose,
      poseState: this.lastPoseState,
    };
  }

  private analyzePose(pose: Pose) {
    const keypoints = pose.keypoints;
    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];
    const leftEye = keypoints[1];
    const rightEye = keypoints[2];

    const shoulderMidpoint = this.calculateMidpoint(leftShoulder, rightShoulder);
    const hipMidpoint = this.calculateMidpoint(leftHip, rightHip);
    const headMidpoint = this.calculateMidpoint(leftEye, rightEye);

    // Calculate body angle
    const bodyAngle = this.calculateBodyAngle(shoulderMidpoint, hipMidpoint);
    const isHorizontal = Math.abs(bodyAngle) > this.FALL_ANGLE_THRESHOLD;

    // Check head position
    const headBelowShoulders = headMidpoint.y > shoulderMidpoint.y + 20;

    // Check for unusual pose
    const shoulderHeightDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    const hipHeightDiff = Math.abs(leftHip.y - rightHip.y);
    const hasUnusualPose = shoulderHeightDiff > 40 || hipHeightDiff > 40;

    return {
      isHorizontal,
      headBelowShoulders,
      hasUnusualPose,
      bodyAngle,
    };
  }

  private analyzeMotion(pose: Pose) {
    if (this.lastPoses.length < 3) {
      return { hasSuddenDrop: false, hasRapidMovement: false };
    }

    const previousPose = this.lastPoses[this.lastPoses.length - 1];
    const currentHead = pose.keypoints[0];
    const previousHead = previousPose.keypoints[0];

    // Check for sudden vertical movement
    const verticalChange = currentHead.y - previousHead.y;
    const hasSuddenDrop = verticalChange > this.VERTICAL_MOVEMENT_THRESHOLD;

    // Check for rapid movement
    let totalMovement = 0;
    for (let i = 1; i < this.lastPoses.length; i++) {
      const current = this.lastPoses[i];
      const previous = this.lastPoses[i - 1];
      
      const headCurrent = current.keypoints[0];
      const headPrevious = previous.keypoints[0];
      
      const movement = Math.sqrt(
        Math.pow(headCurrent.x - headPrevious.x, 2) + 
        Math.pow(headCurrent.y - headPrevious.y, 2)
      );
      
      totalMovement += movement;
    }

    const averageMovement = totalMovement / (this.lastPoses.length - 1);
    const hasRapidMovement = averageMovement > this.RAPID_MOVEMENT_THRESHOLD;

    return {
      hasSuddenDrop,
      hasRapidMovement,
      averageMovement,
    };
  }

  private analyzePosition(pose: Pose) {
    const leftAnkle = pose.keypoints[15];
    const rightAnkle = pose.keypoints[16];
    
    // Check if ankles are near the bottom of the frame
    const frameHeight = 480;
    const ankleY = Math.max(leftAnkle.y, rightAnkle.y);
    const isNearGround = ankleY > frameHeight * 0.8;

    return {
      isNearGround,
    };
  }

  private determinePoseState(
    poseAnalysis: any,
    motionAnalysis: any,
    positionAnalysis: any
  ): PoseState {
    let standing = false;
    let sitting = false;
    let lying = false;
    let falling = false;
    let confidence = 0;

    // Determine primary pose state
    if (poseAnalysis.isHorizontal) {
      lying = true;
      confidence = 0.8;
    } else if (poseAnalysis.bodyAngle < 15) {
      standing = true;
      confidence = 0.9;
    } else if (poseAnalysis.bodyAngle < 45) {
      sitting = true;
      confidence = 0.7;
    }

    // Check for falling motion
    if (motionAnalysis.hasSuddenDrop || motionAnalysis.hasRapidMovement) {
      falling = true;
      confidence = Math.max(confidence, 0.6);
    }

    return {
      standing,
      sitting,
      lying,
      falling,
      confidence,
      lastUpdate: new Date(),
    };
  }

  private calculateMidpoint(point1: PoseKeypoint, point2: PoseKeypoint) {
    return {
      x: (point1.x + point2.x) / 2,
      y: (point1.y + point2.y) / 2,
    };
  }

  private calculateBodyAngle(shoulderMidpoint: { x: number; y: number }, hipMidpoint: { x: number; y: number }): number {
    return Math.atan2(
      hipMidpoint.x - shoulderMidpoint.x,
      shoulderMidpoint.y - hipMidpoint.y
    ) * (180 / Math.PI);
  }

  // Get current pose state for UI display
  getCurrentPoseState(): PoseState {
    return this.lastPoseState;
  }

  // Update detection sensitivity
  updateSensitivity(settings: {
    fallThreshold?: number;
    confidenceThreshold?: number;
    verticalMovementThreshold?: number;
  }): void {
    if (settings.fallThreshold) this.FALL_THRESHOLD = settings.fallThreshold;
    if (settings.confidenceThreshold) this.CONFIDENCE_THRESHOLD = settings.confidenceThreshold;
    if (settings.verticalMovementThreshold) this.VERTICAL_MOVEMENT_THRESHOLD = settings.verticalMovementThreshold;
  }

  reset(): void {
    this.consecutiveFallFrames = 0;
    this.consecutiveLyingFrames = 0;
    this.lastPoses = [];
    this.lastPoseState = {
      standing: false,
      sitting: false,
      lying: false,
      falling: false,
      confidence: 0,
      lastUpdate: new Date(),
    };
  }

  // Method to manually trigger a fall for testing
  triggerTestFall(): FallDetectionResult {
    return {
      hasFallen: true,
      confidence: 0.9,
      reason: 'test fall triggered',
      pose: {
        keypoints: [],
        score: 0.8,
      },
      poseState: {
        standing: false,
        sitting: false,
        lying: true,
        falling: true,
        confidence: 0.9,
        lastUpdate: new Date(),
      },
    };
  }
}

export const fallDetectionService = new FallDetectionService();