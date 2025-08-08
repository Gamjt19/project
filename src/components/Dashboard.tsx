import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  Settings,
  Bell,
  Shield,
  Heart,
  Phone,
  Plus,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { alertService } from '../services/alertService';
import { Elder, Alert, DashboardStats } from '../types';
import { CameraFeed } from './CameraFeed';
import { AlertHistory } from './AlertHistory';
import { ElderProfile } from './ElderProfile';
import { CameraTest } from './CameraTest';

export const Dashboard: React.FC = () => {
  const [elders, setElders] = useState<Elder[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalElders: 0,
    activeAlerts: 0,
    alertsToday: 0,
    systemUptime: '0d 0h',
    avgResponseTime: '< 30s',
  });
  const [selectedElder, setSelectedElder] = useState<Elder | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'monitoring' | 'alerts' | 'settings'>('overview');
  const [showAddElder, setShowAddElder] = useState(false);
  const [newElderData, setNewElderData] = useState({
    name: '',
    age: '',
    medicalInfo: '',
    activityLevel: 'medium' as const,
  });
  const [showFallAlert, setShowFallAlert] = useState(false);
  const [lastFallAlert, setLastFallAlert] = useState<Alert | null>(null);

  useEffect(() => {
    // Load existing data
    alertService.loadAlerts();
    
    // Load data
    const loadedElders = dataService.getElders();
    setElders(loadedElders);
    setAlerts(alertService.getAlerts());
    
    // Select first elder if available
    if (loadedElders.length > 0 && !selectedElder) {
      setSelectedElder(loadedElders[0]);
    }
    
    // Update stats
    updateStats();

    // Set up real-time alert listener
    const handleNewAlert = (alert: Alert) => {
      setAlerts(alertService.getAlerts());
      updateStats();
      
      // Show fall alert notification
      if (alert.type === 'fall_detected') {
        setLastFallAlert(alert);
        setShowFallAlert(true);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
          setShowFallAlert(false);
        }, 10000);
      }
    };

    alertService.onAlert(handleNewAlert);

    return () => {
      alertService.offAlert(handleNewAlert);
    };
  }, []);

  const updateStats = () => {
    const dashboardStats = dataService.getDashboardStats();
    const recentAlerts = alertService.getRecentAlerts();
    setStats({
      ...dashboardStats,
      activeAlerts: recentAlerts.filter(a => !a.acknowledged).length,
      alertsToday: recentAlerts.length,
    });
  };

  const handleFallDetected = async (result: any) => {
    if (selectedElder) {
      console.log('🚨 Fall detected in real-time:', result);
      await alertService.sendEmergencyAlert(selectedElder, 'fall_detected');
      setAlerts(alertService.getAlerts());
      updateStats();
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    alertService.acknowledgeAlert(alertId, 'Caregiver Dashboard');
    setAlerts(alertService.getAlerts());
    updateStats();
  };

  const handleAddElder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newElderData.name || !newElderData.age) return;

    const elder = await dataService.createElder({
      name: newElderData.name,
      age: parseInt(newElderData.age),
      medicalInfo: newElderData.medicalInfo,
      activityLevel: newElderData.activityLevel,
      emergencyContacts: [],
      photo: '',
      isActive: true,
    });

    setElders(dataService.getElders());
    setSelectedElder(elder);
    setShowAddElder(false);
    setNewElderData({ name: '', age: '', medicalInfo: '', activityLevel: 'medium' });
    updateStats();
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'red' | 'yellow';
    change?: string;
  }> = ({ title, value, icon, color, change }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className="text-sm text-gray-500 mt-1">{change}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fall Alert Notification */}
      {showFallAlert && lastFallAlert && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-md animate-pulse">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-200 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-lg">🚨 FALL DETECTED!</h4>
              <p className="text-sm text-red-100 mt-1">{lastFallAlert.description}</p>
              <p className="text-xs text-red-200 mt-2">
                {lastFallAlert.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => setShowFallAlert(false)}
              className="text-red-200 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CareLoop</h1>
                <p className="text-sm text-gray-500">Elder Care Monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {stats.activeAlerts > 0 && (
                <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Bell className="w-4 h-4" />
                  <span>{stats.activeAlerts} Active Alerts</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">System Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <nav className="flex space-x-8 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'monitoring', label: 'Live Monitoring', icon: Heart },
            { id: 'alerts', label: 'Alert History', icon: Bell },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Elders"
                value={stats.totalElders}
                icon={<Users className="w-5 h-5" />}
                color="blue"
              />
              <StatCard
                title="Active Alerts"
                value={stats.activeAlerts}
                icon={<AlertTriangle className="w-5 h-5" />}
                color="red"
              />
              <StatCard
                title="Alerts Today"
                value={stats.alertsToday}
                icon={<Bell className="w-5 h-5" />}
                color="yellow"
                change="Last 24 hours"
              />
              <StatCard
                title="System Uptime"
                value={stats.systemUptime}
                icon={<CheckCircle className="w-5 h-5" />}
                color="green"
                change="99.9% availability"
              />
            </div>

            {/* Elder Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Elder Management</h3>
                <button
                  onClick={() => setShowAddElder(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Elder</span>
                </button>
              </div>

              {elders.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Elders Added</h3>
                  <p className="text-gray-500 mb-4">Add your first elder to start monitoring</p>
                  <button
                    onClick={() => setShowAddElder(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First Elder
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {elders.map((elder) => (
                    <div
                      key={elder.id}
                      onClick={() => setSelectedElder(elder)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedElder?.id === elder.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{elder.name}</h4>
                          <p className="text-sm text-gray-500">{elder.age} years old</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Elder Profile and Recent Alerts */}
            {selectedElder && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ElderProfile elder={selectedElder} />
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {alerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          alert.severity === 'critical' ? 'bg-red-500' :
                          alert.severity === 'high' ? 'bg-orange-500' :
                          alert.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{alert.description}</p>
                          <p className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleString()}
                          </p>
                        </div>
                        {!alert.acknowledged && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    ))}
                    {alerts.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No recent alerts</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            {selectedElder ? (
              <CameraFeed
                elder={selectedElder}
                onFallDetected={handleFallDetected}
              />
            ) : (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Elder Selected</h3>
                <p className="text-gray-500">Select an elder from the overview tab to start monitoring</p>
              </div>
            )}
          </div>
        )}

        {/* Alert History Tab */}
        {activeTab === 'alerts' && (
          <AlertHistory
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">System Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h4 className="font-medium text-gray-900">Fall Detection Sensitivity</h4>
                    <p className="text-sm text-gray-500">Adjust detection sensitivity</p>
                  </div>
                  <select className="border border-gray-300 rounded-lg px-3 py-2">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h4 className="font-medium text-gray-900">Alert Notifications</h4>
                    <p className="text-sm text-gray-500">Configure notification preferences</p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Configure
                  </button>
                </div>
              </div>
            </div>

            {/* Camera Test */}
            <CameraTest />
          </div>
        )}
      </div>

      {/* Add Elder Modal */}
      {showAddElder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Elder</h3>
            <form onSubmit={handleAddElder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newElderData.name}
                  onChange={(e) => setNewElderData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={newElderData.age}
                  onChange={(e) => setNewElderData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Information</label>
                <textarea
                  value={newElderData.medicalInfo}
                  onChange={(e) => setNewElderData(prev => ({ ...prev, medicalInfo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                <select
                  value={newElderData.activityLevel}
                  onChange={(e) => setNewElderData(prev => ({ ...prev, activityLevel: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Elder
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddElder(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};