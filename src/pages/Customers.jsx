import React from 'react';
import { Users } from 'lucide-react';

const Customers = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
        <p className="text-gray-600 mt-2">Manage customer information</p>
      </div>

      <div className="card text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Customer Management</h3>
        <p className="text-gray-600">
          Customer management features coming soon.<br />
          This section will display customer information, order history, and contact details.
        </p>
      </div>
    </div>
  );
};

export default Customers;
