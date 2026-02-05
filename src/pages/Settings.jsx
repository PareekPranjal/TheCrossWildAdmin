import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your admin panel settings</p>
      </div>

      <div className="card text-center py-12">
        <SettingsIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Settings Panel</h3>
        <p className="text-gray-600">
          Settings management coming soon.<br />
          This section will include site configuration, user management, and preferences.
        </p>
      </div>
    </div>
  );
};

export default Settings;
