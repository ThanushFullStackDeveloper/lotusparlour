import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload } from 'lucide-react';
import { getSettings, updateSettings, uploadImage } from '../../utils/api';
import { toast } from 'sonner';

const SettingsManagement = () => {
  const [settings, setSettings] = useState({
    parlour_name: '',
    welcome_text: '',
    hero_image: '',
    logo_image: '',
    years_experience: '',
    opening_time: '',
    closing_time: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await getSettings();
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
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
    try {
      await updateSettings(settings);
      toast.success('Settings updated successfully!');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading settings...</div>;
  }

  return (
    <div data-testid="settings-management">
      <h1 className="text-4xl font-bold mb-6">Homepage Settings</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Parlour Name</label>
            <input
              type="text"
              name="parlour_name"
              value={settings.parlour_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              data-testid="parlour-name-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Welcome Text</label>
            <input
              type="text"
              name="welcome_text"
              value={settings.welcome_text}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              data-testid="welcome-text-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Years of Experience</label>
            <input
              type="text"
              name="years_experience"
              value={settings.years_experience}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., 5+"
              data-testid="years-exp-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Opening Time</label>
              <input
                type="time"
                name="opening_time"
                value={settings.opening_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                data-testid="opening-time-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Closing Time</label>
              <input
                type="time"
                name="closing_time"
                value={settings.closing_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                data-testid="closing-time-input"
              />
            </div>
          </div>

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
              <img src={settings.logo_image} alt="Logo" className="mt-2 w-32 h-32 object-contain" />
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
              <img src={settings.hero_image} alt="Hero" className="mt-2 w-full h-48 object-cover rounded-lg" />
            )}
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center space-x-2" data-testid="save-settings-btn">
            <Save size={20} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsManagement;
