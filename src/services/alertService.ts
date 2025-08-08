import { Alert, Elder, EmergencyContact } from '../types';

export class AlertService {
  private alerts: Alert[] = [];
  private alertCallbacks: ((alert: Alert) => void)[] = [];

  async sendEmergencyAlert(
    elder: Elder, 
    alertType: Alert['type'], 
    snapshot?: string
  ): Promise<void> {
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      elderId: elder.id,
      type: alertType,
      timestamp: new Date(),
      severity: this.determineSeverity(alertType),
      description: this.getAlertDescription(alertType, elder.name),
      snapshot,
      acknowledged: false,
    };

    this.alerts.unshift(alert);

    // Trigger alert callbacks
    this.alertCallbacks.forEach(callback => callback(alert));

    // Simulate sending alerts to emergency contacts
    for (const contact of elder.emergencyContacts) {
      await this.sendNotification(contact, alert, elder);
    }

    // Store in localStorage for persistence
    this.saveAlerts();

    // Log the alert for debugging
    console.log('🚨 FALL DETECTED:', {
      elder: elder.name,
      alertType,
      severity: alert.severity,
      description: alert.description,
      timestamp: alert.timestamp,
    });
  }

  private determineSeverity(type: Alert['type']): Alert['severity'] {
    switch (type) {
      case 'fall_detected':
        return 'critical';
      case 'inactivity':
        return 'high';
      case 'emergency':
        return 'critical';
      case 'wellness_check':
        return 'low';
      default:
        return 'medium';
    }
  }

  private getAlertDescription(type: Alert['type'], elderName: string): string {
    switch (type) {
      case 'fall_detected':
        return `🚨 FALL DETECTED for ${elderName}! Immediate assistance may be required. Please check on them immediately.`;
      case 'inactivity':
        return `${elderName} has been inactive for an extended period. Please check on them.`;
      case 'emergency':
        return `🚨 Emergency alert triggered for ${elderName}.`;
      case 'wellness_check':
        return `Daily wellness check: ${elderName} is doing well.`;
      default:
        return `Alert for ${elderName}`;
    }
  }

  private async sendNotification(
    contact: EmergencyContact, 
    alert: Alert, 
    elder: Elder
  ): Promise<void> {
    // Simulate API call to Twilio or other service
    console.log(`📱 Sending ${contact.preferredMethod} to ${contact.phone}:`, {
      message: alert.description,
      elderName: elder.name,
      timestamp: alert.timestamp,
      severity: alert.severity,
      snapshot: alert.snapshot,
    });

    // In a real implementation, this would call Twilio API:
    /*
    if (contact.preferredMethod === 'whatsapp') {
      await this.sendWhatsApp(contact.phone, alert.description, alert.snapshot);
    } else if (contact.preferredMethod === 'sms') {
      await this.sendSMS(contact.phone, alert.description);
    }
    */
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
      this.saveAlerts();
      
      console.log('✅ Alert acknowledged:', {
        alertId,
        acknowledgedBy,
        timestamp: alert.acknowledgedAt,
      });
    }
  }

  getAlerts(): Alert[] {
    return this.alerts;
  }

  getRecentAlerts(hours: number = 24): Alert[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.alerts.filter(alert => alert.timestamp >= cutoff);
  }

  // Add callback for real-time alert notifications
  onAlert(callback: (alert: Alert) => void): void {
    this.alertCallbacks.push(callback);
  }

  // Remove callback
  offAlert(callback: (alert: Alert) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  private saveAlerts(): void {
    localStorage.setItem('careloop-alerts', JSON.stringify(this.alerts));
  }

  loadAlerts(): void {
    const saved = localStorage.getItem('careloop-alerts');
    if (saved) {
      this.alerts = JSON.parse(saved).map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
        acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : undefined,
      }));
    }
  }

  // Simulate daily wellness check
  async sendDailyWellnessCheck(elder: Elder): Promise<void> {
    await this.sendEmergencyAlert(elder, 'wellness_check');
  }

  // Test fall detection - for demonstration purposes
  async triggerTestFall(elder: Elder): Promise<void> {
    console.log('🧪 Triggering test fall for:', elder.name);
    await this.sendEmergencyAlert(elder, 'fall_detected', 'test-snapshot');
  }

  // Clear all alerts (for testing)
  clearAlerts(): void {
    this.alerts = [];
    this.saveAlerts();
    console.log('🗑️ All alerts cleared');
  }
}

export const alertService = new AlertService();