import React from 'react';
import { BarChart3 } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-600 mt-2">View detailed analytics and insights</p>
      </div>

      <div className="card text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Analytics Dashboard</h3>
        <p className="text-gray-600">
          Advanced analytics features coming soon.<br />
          This section will include sales trends, traffic analysis, and performance metrics.
        </p>
      </div>
    </div>
  );
};

export default Analytics;
