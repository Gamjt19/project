import React from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  Heart, 
  Calendar,
  Shield,
  Activity,
  Users,
} from 'lucide-react';
import { Elder } from '../types';

interface ElderProfileProps {
  elder: Elder;
}

export const ElderProfile: React.FC<ElderProfileProps> = ({ elder }) => {
  const getActivityLevelColor = (level: Elder['activityLevel']) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start space-x-4 mb-6">
        <div className="flex-shrink-0">
          {elder.photo ? (
            <img
              src={elder.photo}
              alt={elder.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{elder.name}</h2>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Age {elder.age}</span>
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityLevelColor(elder.activityLevel)}`}>
              {elder.activityLevel.charAt(0).toUpperCase() + elder.activityLevel.slice(1)} Activity
            </span>
            <div className={`flex items-center space-x-1 text-sm ${elder.isActive ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${elder.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span>{elder.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      {elder.medicalInfo && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <Heart className="w-4 h-4 mr-2 text-red-500" />
            Medical Information
          </h3>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            {elder.medicalInfo}
          </p>
        </div>
      )}

      {/* Emergency Contacts */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <Users className="w-4 h-4 mr-2 text-blue-500" />
          Emergency Contacts ({elder.emergencyContacts.length})
        </h3>
        
        <div className="space-y-3">
          {elder.emergencyContacts.slice(0, 3).map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    contact.isPrimary ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                  <p className="text-xs text-gray-500">{contact.relationship}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {contact.isPrimary && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                )}
                
                <div className="flex items-center space-x-1">
                  <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Call">
                    <Phone className="w-4 h-4" />
                  </button>
                  {contact.email && (
                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Email">
                      <Mail className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {elder.emergencyContacts.length > 3 && (
            <button className="w-full text-sm text-blue-600 hover:text-blue-700 py-2 text-center">
              View all {elder.emergencyContacts.length} contacts →
            </button>
          )}
        </div>
      </div>

      {/* Profile Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Shield className="w-3 h-3" />
          <span>Monitoring since {elder.createdAt.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Activity className="w-3 h-3" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};