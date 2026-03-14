import React, { useEffect, useState } from 'react';
import { Save, Clock, Lock, Eye, EyeOff } from 'lucide-react';
import { getSettings, updateSettings, uploadImage, changeAdminPassword } from '../../utils/api';
import { toast } from 'sonner';

const DEFAULT_WEEKLY_HOURS = [
  { day: 'Monday', start_time: '09:00', end_time: '22:00', is_open: true },
  { day: 'Tuesday', start_time: '09:00', end_time: '22:00', is_open: true },
  { day: 'Wednesday', start_time: '09:00', end_time: '22:00', is_open: true },
  { day: 'Thursday', start_time: '09:00', end_time: '22:00', is_open: true },
  { day: 'Friday', start_time: '09:00', end_time: '22:00', is_open: true },
  { day: 'Saturday', start_time: '09:00', end_time: '22:00', is_open: true },
  { day: 'Sunday', start_time: '09:00', end_time: '22:00', is_open: true },
];

const SettingsManagement = () => {
  const [settings, setSettings] = useState({
    parlour_name: '',
    welcome_text: '',
    hero_image: '',
    logo_image: '',
    years_experience: '',
    opening_time: '',
    closing_time: '',
    weekly_hours: DEFAULT_WEEKLY_HOURS
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await getSettings();
      setSettings({
        ...response.data,
        weekly_hours: response.data.weekly_hours || DEFAULT_WEEKLY_HOURS
      });
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleWeeklyHoursChange = (dayIndex, field, value) => {
    const newWeeklyHours = [...settings.weekly_hours];
    newWeeklyHours[dayIndex] = {
      ...newWeeklyHours[dayIndex],
      [field]: field === 'is_open' ? value : value
    };
    setSettings({ ...settings, weekly_hours: newWeeklyHours });
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const uploadRes = await uploadImage(file);
      setSettings({ ...settings, [field]: uploadRes.data.url });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(settings);
      toast.success('Settings updated successfully!');
      fetchSettings();
      // Dispatch event to notify Navbar to refresh settings (for logo update)
      window.dispatchEvent(new CustomEvent('settings-updated'));
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await changeAdminPassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      toast.success('Password changed successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : 'Failed to change password';
      toast.error(errorMsg);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading settings...</div>;
  }

  return (
    <div data-testid="settings-management">
      <h1 className="text-4xl font-bold mb-6">Homepage Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">General Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Parlour Name</label>
              <input
                type="text"
                name="parlour_name"
                value={settings.parlour_name || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                data-testid="parlour-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Years of Experience</label>
              <input
                type="text"
                name="years_experience"
                value={settings.years_experience || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="e.g., 5+"
                data-testid="years-exp-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Welcome Text</label>
            <input
              type="text"
              name="welcome_text"
              value={settings.welcome_text || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              data-testid="welcome-text-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Logo Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'logo_image')}
                className="w-full px-4 py-2 border rounded-lg"
                data-testid="logo-upload"
              />
              {settings.logo_image && (
                <img src={settings.logo_image} alt="Logo" className="mt-2 w-24 h-24 object-contain border rounded" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hero Background Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'hero_image')}
                className="w-full px-4 py-2 border rounded-lg"
                data-testid="hero-upload"
              />
              {settings.hero_image && (
                <img src={settings.hero_image} alt="Hero" className="mt-2 w-full h-32 object-cover rounded" />
              )}
            </div>
          </div>
        </div>

        {/* Weekly Working Hours */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 mb-4 border-b pb-2">
            <Clock size={20} className="text-[var(--secondary)]" />
            <h2 className="text-xl font-semibold">Weekly Working Hours</h2>
          </div>
          
          <div className="space-y-3">
            {settings.weekly_hours.map((dayConfig, index) => (
              <div 
                key={dayConfig.day} 
                className={`grid grid-cols-4 gap-4 items-center p-3 rounded-lg ${
                  dayConfig.is_open ? 'bg-green-50' : 'bg-red-50'
                }`}
                data-testid={`weekly-hours-${dayConfig.day.toLowerCase()}`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={dayConfig.is_open}
                    onChange={(e) => handleWeeklyHoursChange(index, 'is_open', e.target.checked)}
                    className="w-5 h-5 rounded text-[var(--secondary)] focus:ring-[var(--secondary)]"
                    data-testid={`toggle-${dayConfig.day.toLowerCase()}`}
                  />
                  <span className={`font-medium ${dayConfig.is_open ? '' : 'text-gray-400'}`}>
                    {dayConfig.day}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-500">From:</label>
                  <input
                    type="time"
                    value={dayConfig.start_time}
                    onChange={(e) => handleWeeklyHoursChange(index, 'start_time', e.target.value)}
                    disabled={!dayConfig.is_open}
                    className="px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    data-testid={`start-time-${dayConfig.day.toLowerCase()}`}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-500">To:</label>
                  <input
                    type="time"
                    value={dayConfig.end_time}
                    onChange={(e) => handleWeeklyHoursChange(index, 'end_time', e.target.value)}
                    disabled={!dayConfig.is_open}
                    className="px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    data-testid={`end-time-${dayConfig.day.toLowerCase()}`}
                  />
                </div>
                
                <div className="text-right">
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    dayConfig.is_open 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {dayConfig.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Configure working hours for each day. Uncheck a day to mark it as closed.
          </p>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50" 
          data-testid="save-settings-btn"
        >
          <Save size={20} />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </form>

      {/* Admin Password Reset */}
      <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
        <div className="flex items-center space-x-2 mb-4 border-b pb-2">
          <Lock size={20} className="text-[var(--secondary)]" />
          <h2 className="text-xl font-semibold">Change Admin Password</h2>
        </div>
        
        <form onSubmit={handlePasswordChange} className="space-y-4" data-testid="password-change-form">
          <div>
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                required
                className="w-full px-4 py-2 pr-10 border rounded-lg"
                placeholder="Enter current password"
                data-testid="current-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-2.5 text-gray-400"
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                required
                className="w-full px-4 py-2 pr-10 border rounded-lg"
                placeholder="Enter new password"
                data-testid="new-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-2.5 text-gray-400"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                required
                className="w-full px-4 py-2 pr-10 border rounded-lg"
                placeholder="Confirm new password"
                data-testid="confirm-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-2.5 text-gray-400"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={changingPassword}
            className="btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50" 
            data-testid="change-password-btn"
          >
            <Lock size={18} />
            <span>{changingPassword ? 'Changing...' : 'Change Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsManagement;
