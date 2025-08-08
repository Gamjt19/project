import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
import { PoseKeypoint, Pose, FallDetectionResult } from '../types';

export class FallDetectionService {
  private model: posenet.PoseNet | null = null;
  private isInitialized = false;
  private lastPoses: Pose[] = [];
  private consecutiveFallFrames = 0;
  private readonly FALL_THRESHOLD = 2; // consecutive frames needed (reduced for faster detection)
  private readonly CONFIDENCE_THRESHOLD = 0.5; // reduced for better detection
  private readonly MIN_POSE_SCORE = 0.3; // minimum score for individual keypoints

  async initialize(): Promise<void> {
    try {
      // Ensure TensorFlow.js backend is ready
      await tf.ready();
      
      // Load PoseNet model
      this.model = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75,
      });
      this.isInitialized = true;
      console.log('Fall detection model initialized');
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
      };
    }

    // Key body parts for fall detection
    const keypoints = pose.keypoints;
    const nose = keypoints[0];
    const leftEye = keypoints[1];
    const rightEye = keypoints[2];
    const leftEar = keypoints[3];
    const rightEar = keypoints[4];
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

    // Enhanced fall detection logic
    let fallConfidence = 0;
    let reasons: string[] = [];

    // 1. Check if person is lying down (horizontal position)
    const bodyAngle = this.calculateBodyAngle(shoulderMidpoint, hipMidpoint);
    const isHorizontal = Math.abs(bodyAngle) > 30; // More sensitive threshold

    if (isHorizontal) {
      fallConfidence += 0.4;
      reasons.push('horizontal body position');
    }

    // 2. Check if head is below shoulders (person on ground)
    const headBelowShoulders = headMidpoint.y > shoulderMidpoint.y + 30;
    if (headBelowShoulders) {
      fallConfidence += 0.3;
      reasons.push('head below shoulders');
    }

    // 3. Check for sudden vertical movement (falling motion)
    const hasSuddenDrop = this.checkSuddenDrop(pose);
    if (hasSuddenDrop) {
      fallConfidence += 0.5;
      reasons.push('sudden vertical movement');
    }

    // 4. Check if person is close to ground (ankles near bottom of frame)
    const isNearGround = this.checkNearGround(pose);
    if (isNearGround) {
      fallConfidence += 0.2;
      reasons.push('near ground level');
    }

    // 5. Check for unusual pose (arms/legs in unexpected positions)
    const hasUnusualPose = this.checkUnusualPose(pose);
    if (hasUnusualPose) {
      fallConfidence += 0.3;
      reasons.push('unusual body position');
    }

    // 6. Check for rapid movement (falling motion)
    const hasRapidMovement = this.checkRapidMovement(pose);
    if (hasRapidMovement) {
      fallConfidence += 0.4;
      reasons.push('rapid movement detected');
    }

    // Store pose history for analysis
    this.lastPoses.push(pose);
    if (this.lastPoses.length > 15) { // Increased history for better analysis
      this.lastPoses.shift();
    }

    // Determine if fall has occurred
    const hasFallen = fallConfidence > 0.6; // Lower threshold for faster detection

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

  private checkSuddenDrop(currentPose: Pose): boolean {
    if (this.lastPoses.length < 3) return false;

    const previousPose = this.lastPoses[this.lastPoses.length - 1];
    const currentHead = currentPose.keypoints[0]; // nose
    const previousHead = previousPose.keypoints[0];

    // Check for sudden vertical movement (falling)
    const verticalChange = currentHead.y - previousHead.y;
    return verticalChange > 80; // pixels - more sensitive
  }

  private checkNearGround(pose: Pose): boolean {
    const leftAnkle = pose.keypoints[15];
    const rightAnkle = pose.keypoints[16];
    
    // Check if ankles are near the bottom of the frame
    const frameHeight = 480; // Assuming 480p video
    const ankleY = Math.max(leftAnkle.y, rightAnkle.y);
    
    return ankleY > frameHeight * 0.8; // Ankles in bottom 20% of frame
  }

  private checkUnusualPose(pose: Pose): boolean {
    const keypoints = pose.keypoints;
    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];

    // Check if shoulders are at very different heights (person might be lying)
    const shoulderHeightDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    const hipHeightDiff = Math.abs(leftHip.y - rightHip.y);

    return shoulderHeightDiff > 50 || hipHeightDiff > 50;
  }

  private checkRapidMovement(pose: Pose): boolean {
    if (this.lastPoses.length < 5) return false;

    // Check for rapid movement in the last few frames
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
    return averageMovement > 30; // High average movement indicates falling
  }

  reset(): void {
    this.consecutiveFallFrames = 0;
    this.lastPoses = [];
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
    };
  }
}

export const fallDetectionService = new FallDetectionService();