export interface Elder {
  id: string;
  name: string;
  age: number;
  photo?: string;
  emergencyContacts: EmergencyContact[];
  medicalInfo?: string;
  activityLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
  isActive: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  preferredMethod: 'sms' | 'whatsapp' | 'call';
  isPrimary: boolean;
}

export interface Alert {
  id: string;
  elderId: string;
  type: 'fall_detected' | 'inactivity' | 'wellness_check' | 'emergency';
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  snapshot?: string;
  location?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  response?: string;
}

export interface PoseKeypoint {
  x: number;
  y: number;
  score: number;
}

export interface Pose {
  keypoints: PoseKeypoint[];
  score: number;
}

export interface FallDetectionResult {
  hasFallen: boolean;
  confidence: number;
  reason: string;
  pose?: Pose;
}

export interface SystemStatus {
  isActive: boolean;
  cameraStatus: 'connected' | 'disconnected' | 'error';
  lastActivity: Date;
  alertsToday: number;
  systemHealth: 'good' | 'warning' | 'error';
}

export interface DashboardStats {
  totalElders: number;
  activeAlerts: number;
  alertsToday: number;
  systemUptime: string;
  avgResponseTime: string;
}