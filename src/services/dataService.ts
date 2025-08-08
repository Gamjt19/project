import { Elder, EmergencyContact, DashboardStats, SystemStatus } from '../types';

export class DataService {
  private elders: Elder[] = [];
  private readonly STORAGE_KEY = 'careloop-elders';

  constructor() {
    this.loadElders();
  }

  // Elder management
  async createElder(elderData: Omit<Elder, 'id' | 'createdAt'>): Promise<Elder> {
    const elder: Elder = {
      ...elderData,
      id: `elder-${Date.now()}`,
      createdAt: new Date(),
    };

    this.elders.push(elder);
    this.saveElders();
    return elder;
  }

  async updateElder(id: string, updates: Partial<Elder>): Promise<Elder | null> {
    const index = this.elders.findIndex(e => e.id === id);
    if (index === -1) return null;

    this.elders[index] = { ...this.elders[index], ...updates };
    this.saveElders();
    return this.elders[index];
  }

  async deleteElder(id: string): Promise<boolean> {
    const index = this.elders.findIndex(e => e.id === id);
    if (index === -1) return false;

    this.elders.splice(index, 1);
    this.saveElders();
    return true;
  }

  getElders(): Elder[] {
    return this.elders;
  }

  getElder(id: string): Elder | null {
    return this.elders.find(e => e.id === id) || null;
  }

  // Emergency contact management
  async addEmergencyContact(elderId: string, contact: Omit<EmergencyContact, 'id'>): Promise<boolean> {
    const elder = this.getElder(elderId);
    if (!elder) return false;

    const newContact: EmergencyContact = {
      ...contact,
      id: `contact-${Date.now()}`,
    };

    elder.emergencyContacts.push(newContact);
    this.saveElders();
    return true;
  }

  async updateEmergencyContact(
    elderId: string, 
    contactId: string, 
    updates: Partial<EmergencyContact>
  ): Promise<boolean> {
    const elder = this.getElder(elderId);
    if (!elder) return false;

    const contactIndex = elder.emergencyContacts.findIndex(c => c.id === contactId);
    if (contactIndex === -1) return false;

    elder.emergencyContacts[contactIndex] = {
      ...elder.emergencyContacts[contactIndex],
      ...updates,
    };

    this.saveElders();
    return true;
  }

  async removeEmergencyContact(elderId: string, contactId: string): Promise<boolean> {
    const elder = this.getElder(elderId);
    if (!elder) return false;

    const contactIndex = elder.emergencyContacts.findIndex(c => c.id === contactId);
    if (contactIndex === -1) return false;

    elder.emergencyContacts.splice(contactIndex, 1);
    this.saveElders();
    return true;
  }

  // Dashboard stats
  getDashboardStats(): DashboardStats {
    const totalElders = this.elders.length;
    const activeElders = this.elders.filter(e => e.isActive).length;

    return {
      totalElders,
      activeAlerts: 0, // Will be populated by AlertService
      alertsToday: 0, // Will be populated by AlertService
      systemUptime: this.formatUptime(Date.now() - (Date.now() - 24 * 60 * 60 * 1000)),
      avgResponseTime: '< 30s',
    };
  }

  getSystemStatus(): SystemStatus {
    return {
      isActive: true,
      cameraStatus: 'connected',
      lastActivity: new Date(),
      alertsToday: 0,
      systemHealth: 'good',
    };
  }

  private saveElders(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.elders));
  }

  private loadElders(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      this.elders = JSON.parse(saved).map((elder: any) => ({
        ...elder,
        createdAt: new Date(elder.createdAt),
      }));
    }
  }

  private formatUptime(ms: number): string {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    return `${days}d ${hours}h`;
  }
}

export const dataService = new DataService();