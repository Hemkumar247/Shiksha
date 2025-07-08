import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Volume2, 
  Smartphone, 
  Monitor, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Lock,
  Unlock,
  Mail,
  MessageSquare,
  Calendar,
  BookOpen,
  Users,
  BarChart3,
  Mic,
  Camera,
  Wifi,
  Database,
  Cloud,
  HardDrive,
  Zap
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsData {
  profile: {
    displayName: string;
    email: string;
    avatar: string;
    timezone: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    lessonReminders: boolean;
    studentUpdates: boolean;
    systemUpdates: boolean;
    weeklyReports: boolean;
    achievementAlerts: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'school-only';
    shareAnalytics: boolean;
    allowDataCollection: boolean;
    twoFactorAuth: boolean;
    sessionTimeout: number;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    colorScheme: 'default' | 'blue' | 'green' | 'purple';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    animations: boolean;
  };
  voice: {
    voiceInput: boolean;
    voiceLanguage: string;
    speechRate: number;
    voiceVolume: number;
    autoSpeak: boolean;
  };
  teaching: {
    defaultGrade: string;
    defaultSubject: string;
    lessonDuration: number;
    autoSave: boolean;
    culturalContext: boolean;
    festivalIntegration: boolean;
  };
  data: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    storageLocation: 'local' | 'cloud';
    dataRetention: number;
    exportFormat: 'json' | 'csv' | 'pdf';
  };
}

export const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [activeSection, setActiveSection] = useState('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [settings, setSettings] = useState<SettingsData>({
    profile: {
      displayName: 'Sudha Krishnamurthy',
      email: 'sudha.krishnamurthy@school.edu',
      avatar: '',
      timezone: 'Asia/Kolkata',
      language: 'en'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      lessonReminders: true,
      studentUpdates: true,
      systemUpdates: false,
      weeklyReports: true,
      achievementAlerts: true
    },
    privacy: {
      profileVisibility: 'school-only',
      shareAnalytics: true,
      allowDataCollection: false,
      twoFactorAuth: false,
      sessionTimeout: 30
    },
    appearance: {
      theme: 'light',
      colorScheme: 'default',
      fontSize: 'medium',
      compactMode: false,
      animations: true
    },
    voice: {
      voiceInput: true,
      voiceLanguage: 'ta-IN',
      speechRate: 1.0,
      voiceVolume: 0.8,
      autoSpeak: true
    },
    teaching: {
      defaultGrade: 'Grade 3',
      defaultSubject: 'Tamil',
      lessonDuration: 45,
      autoSave: true,
      culturalContext: true,
      festivalIntegration: true
    },
    data: {
      autoBackup: true,
      backupFrequency: 'weekly',
      storageLocation: 'cloud',
      dataRetention: 365,
      exportFormat: 'json'
    }
  });

  const settingSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'voice', label: 'Voice & Audio', icon: Volume2 },
    { id: 'teaching', label: 'Teaching Preferences', icon: BookOpen },
    { id: 'data', label: 'Data & Backup', icon: Database }
  ];

  const handleSettingChange = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    // Save settings logic here
    setHasUnsavedChanges(false);
    // Show success message
  };

  const handleResetSettings = () => {
    // Reset to default settings
    setHasUnsavedChanges(false);
  };

  const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    label: string;
    description?: string;
  }> = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <motion.button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-gray-200'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
          layout
        />
      </motion.button>
    </div>
  );

  const SelectField: React.FC<{
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    description?: string;
  }> = ({ label, value, options, onChange, description }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const SliderField: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    unit?: string;
  }> = ({ label, value, min, max, step, onChange, unit = '' }) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Customize your Shiksha experience</p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex space-x-2">
            <motion.button
              onClick={handleSaveSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </motion.button>
            <motion.button
              onClick={handleResetSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset</span>
            </motion.button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
            <nav className="space-y-1">
              {settingSections.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <section.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{section.label}</span>
                </motion.button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {activeSection === 'profile' && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Display Name</label>
                    <input
                      type="text"
                      value={settings.profile.displayName}
                      onChange={(e) => handleSettingChange('profile', 'displayName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <SelectField
                  label="Timezone"
                  value={settings.profile.timezone}
                  options={[
                    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
                    { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
                    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' }
                  ]}
                  onChange={(value) => handleSettingChange('profile', 'timezone', value)}
                />

                <SelectField
                  label="Interface Language"
                  value={settings.profile.language}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'ta', label: 'தமிழ் (Tamil)' },
                    { value: 'hi', label: 'हिन्दी (Hindi)' }
                  ]}
                  onChange={(value) => {
                    handleSettingChange('profile', 'language', value);
                    setLanguage(value as 'en' | 'ta');
                  }}
                />
              </motion.div>
            )}

            {activeSection === 'notifications' && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <ToggleSwitch
                    enabled={settings.notifications.emailNotifications}
                    onChange={(value) => handleSettingChange('notifications', 'emailNotifications', value)}
                    label="Email Notifications"
                    description="Receive notifications via email"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.notifications.pushNotifications}
                    onChange={(value) => handleSettingChange('notifications', 'pushNotifications', value)}
                    label="Push Notifications"
                    description="Receive browser push notifications"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.notifications.lessonReminders}
                    onChange={(value) => handleSettingChange('notifications', 'lessonReminders', value)}
                    label="Lesson Reminders"
                    description="Get reminded about upcoming lessons"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.notifications.studentUpdates}
                    onChange={(value) => handleSettingChange('notifications', 'studentUpdates', value)}
                    label="Student Updates"
                    description="Notifications about student progress and feedback"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.notifications.weeklyReports}
                    onChange={(value) => handleSettingChange('notifications', 'weeklyReports', value)}
                    label="Weekly Reports"
                    description="Receive weekly teaching performance reports"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.notifications.achievementAlerts}
                    onChange={(value) => handleSettingChange('notifications', 'achievementAlerts', value)}
                    label="Achievement Alerts"
                    description="Get notified when you unlock new achievements"
                  />
                </div>
              </motion.div>
            )}

            {activeSection === 'privacy' && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold text-gray-900">Privacy & Security</h3>
                
                <SelectField
                  label="Profile Visibility"
                  value={settings.privacy.profileVisibility}
                  options={[
                    { value: 'public', label: 'Public - Visible to everyone' },
                    { value: 'school-only', label: 'School Only - Visible to school members' },
                    { value: 'private', label: 'Private - Only visible to you' }
                  ]}
                  onChange={(value) => handleSettingChange('privacy', 'profileVisibility', value as any)}
                  description="Control who can see your profile information"
                />

                <div className="space-y-4">
                  <ToggleSwitch
                    enabled={settings.privacy.twoFactorAuth}
                    onChange={(value) => handleSettingChange('privacy', 'twoFactorAuth', value)}
                    label="Two-Factor Authentication"
                    description="Add an extra layer of security to your account"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.privacy.shareAnalytics}
                    onChange={(value) => handleSettingChange('privacy', 'shareAnalytics', value)}
                    label="Share Analytics"
                    description="Help improve Shiksha by sharing anonymous usage data"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.privacy.allowDataCollection}
                    onChange={(value) => handleSettingChange('privacy', 'allowDataCollection', value)}
                    label="Data Collection"
                    description="Allow collection of usage data for personalization"
                  />
                </div>

                <SelectField
                  label="Session Timeout"
                  value={settings.privacy.sessionTimeout.toString()}
                  options={[
                    { value: '15', label: '15 minutes' },
                    { value: '30', label: '30 minutes' },
                    { value: '60', label: '1 hour' },
                    { value: '240', label: '4 hours' },
                    { value: '0', label: 'Never' }
                  ]}
                  onChange={(value) => handleSettingChange('privacy', 'sessionTimeout', parseInt(value))}
                  description="Automatically log out after period of inactivity"
                />
              </motion.div>
            )}

            {activeSection === 'appearance' && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold text-gray-900">Appearance Settings</h3>
                
                <SelectField
                  label="Theme"
                  value={settings.appearance.theme}
                  options={[
                    { value: 'light', label: 'Light Theme' },
                    { value: 'dark', label: 'Dark Theme' },
                    { value: 'auto', label: 'Auto (System)' }
                  ]}
                  onChange={(value) => handleSettingChange('appearance', 'theme', value as any)}
                />

                <SelectField
                  label="Color Scheme"
                  value={settings.appearance.colorScheme}
                  options={[
                    { value: 'default', label: 'Default (Teal & Orange)' },
                    { value: 'blue', label: 'Blue' },
                    { value: 'green', label: 'Green' },
                    { value: 'purple', label: 'Purple' }
                  ]}
                  onChange={(value) => handleSettingChange('appearance', 'colorScheme', value as any)}
                />

                <SelectField
                  label="Font Size"
                  value={settings.appearance.fontSize}
                  options={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' }
                  ]}
                  onChange={(value) => handleSettingChange('appearance', 'fontSize', value as any)}
                />

                <div className="space-y-4">
                  <ToggleSwitch
                    enabled={settings.appearance.compactMode}
                    onChange={(value) => handleSettingChange('appearance', 'compactMode', value)}
                    label="Compact Mode"
                    description="Reduce spacing and padding for more content on screen"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.appearance.animations}
                    onChange={(value) => handleSettingChange('appearance', 'animations', value)}
                    label="Animations"
                    description="Enable smooth animations and transitions"
                  />
                </div>
              </motion.div>
            )}

            {activeSection === 'voice' && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold text-gray-900">Voice & Audio Settings</h3>
                
                <ToggleSwitch
                  enabled={settings.voice.voiceInput}
                  onChange={(value) => handleSettingChange('voice', 'voiceInput', value)}
                  label="Voice Input"
                  description="Enable voice commands and dictation"
                />

                <SelectField
                  label="Voice Language"
                  value={settings.voice.voiceLanguage}
                  options={[
                    { value: 'en-US', label: 'English (US)' },
                    { value: 'en-IN', label: 'English (India)' },
                    { value: 'ta-IN', label: 'Tamil (India)' },
                    { value: 'hi-IN', label: 'Hindi (India)' }
                  ]}
                  onChange={(value) => handleSettingChange('voice', 'voiceLanguage', value)}
                />

                <SliderField
                  label="Speech Rate"
                  value={settings.voice.speechRate}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  onChange={(value) => handleSettingChange('voice', 'speechRate', value)}
                  unit="x"
                />

                <SliderField
                  label="Voice Volume"
                  value={settings.voice.voiceVolume}
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={(value) => handleSettingChange('voice', 'voiceVolume', value)}
                  unit="%"
                />

                <ToggleSwitch
                  enabled={settings.voice.autoSpeak}
                  onChange={(value) => handleSettingChange('voice', 'autoSpeak', value)}
                  label="Auto-Speak Responses"
                  description="Automatically read AI responses aloud"
                />
              </motion.div>
            )}

            {activeSection === 'teaching' && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold text-gray-900">Teaching Preferences</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Default Grade"
                    value={settings.teaching.defaultGrade}
                    options={[
                      { value: 'Grade 1', label: 'Grade 1' },
                      { value: 'Grade 2', label: 'Grade 2' },
                      { value: 'Grade 3', label: 'Grade 3' },
                      { value: 'Grade 4', label: 'Grade 4' },
                      { value: 'Grade 5', label: 'Grade 5' }
                    ]}
                    onChange={(value) => handleSettingChange('teaching', 'defaultGrade', value)}
                  />

                  <SelectField
                    label="Default Subject"
                    value={settings.teaching.defaultSubject}
                    options={[
                      { value: 'Tamil', label: 'Tamil' },
                      { value: 'English', label: 'English' },
                      { value: 'Mathematics', label: 'Mathematics' },
                      { value: 'Science', label: 'Science' }
                    ]}
                    onChange={(value) => handleSettingChange('teaching', 'defaultSubject', value)}
                  />
                </div>

                <SliderField
                  label="Default Lesson Duration"
                  value={settings.teaching.lessonDuration}
                  min={15}
                  max={120}
                  step={15}
                  onChange={(value) => handleSettingChange('teaching', 'lessonDuration', value)}
                  unit=" minutes"
                />

                <div className="space-y-4">
                  <ToggleSwitch
                    enabled={settings.teaching.autoSave}
                    onChange={(value) => handleSettingChange('teaching', 'autoSave', value)}
                    label="Auto-Save Lesson Plans"
                    description="Automatically save lesson plans as you work"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.teaching.culturalContext}
                    onChange={(value) => handleSettingChange('teaching', 'culturalContext', value)}
                    label="Cultural Context Integration"
                    description="Include Tamil cultural context in lesson suggestions"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.teaching.festivalIntegration}
                    onChange={(value) => handleSettingChange('teaching', 'festivalIntegration', value)}
                    label="Festival Integration"
                    description="Suggest festival-themed lessons and activities"
                  />
                </div>
              </motion.div>
            )}

            {activeSection === 'data' && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold text-gray-900">Data & Backup Settings</h3>
                
                <ToggleSwitch
                  enabled={settings.data.autoBackup}
                  onChange={(value) => handleSettingChange('data', 'autoBackup', value)}
                  label="Automatic Backup"
                  description="Automatically backup your data and lesson plans"
                />

                <SelectField
                  label="Backup Frequency"
                  value={settings.data.backupFrequency}
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' }
                  ]}
                  onChange={(value) => handleSettingChange('data', 'backupFrequency', value as any)}
                />

                <SelectField
                  label="Storage Location"
                  value={settings.data.storageLocation}
                  options={[
                    { value: 'cloud', label: 'Cloud Storage' },
                    { value: 'local', label: 'Local Device' }
                  ]}
                  onChange={(value) => handleSettingChange('data', 'storageLocation', value as any)}
                />

                <SliderField
                  label="Data Retention Period"
                  value={settings.data.dataRetention}
                  min={30}
                  max={1095}
                  step={30}
                  onChange={(value) => handleSettingChange('data', 'dataRetention', value)}
                  unit=" days"
                />

                <SelectField
                  label="Export Format"
                  value={settings.data.exportFormat}
                  options={[
                    { value: 'json', label: 'JSON' },
                    { value: 'csv', label: 'CSV' },
                    { value: 'pdf', label: 'PDF' }
                  ]}
                  onChange={(value) => handleSettingChange('data', 'exportFormat', value as any)}
                />

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <motion.button
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Data</span>
                  </motion.button>
                  
                  <motion.button
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Upload className="h-4 w-4" />
                    <span>Import Data</span>
                  </motion.button>
                  
                  <motion.button
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear Data</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};