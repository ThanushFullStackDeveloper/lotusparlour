import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, RefreshCw } from 'lucide-react';
import { getCustomers, adminResetCustomerPassword } from '../../utils/api';
import { toast } from 'sonner';

const CustomersManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId, userName) => {
    if (window.confirm(`Reset password for ${userName}? They will be prompted to create a new password on next login.`)) {
      try {
        const response = await adminResetCustomerPassword(userId);
        toast.success(`Password reset! Temporary password: ${response.data.temporary_password}`);
      } catch (error) {
        toast.error('Failed to reset password');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading customers...</div>;
  }

  return (
    <div data-testid="customers-management">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Customer Management</h1>
          <p className="text-gray-600">{customers.length} total customers</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full" data-testid="customers-table">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Bookings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((customer, index) => (
              <motion.tr key={customer.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid={`customer-row-${index}`}>
                <td className="px-6 py-4 font-medium">{customer.name}</td>
                <td className="px-6 py-4">{customer.email}</td>
                <td className="px-6 py-4">{customer.phone}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {customer.total_bookings}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleResetPassword(customer.id, customer.name)}
                    className="flex items-center space-x-1 text-orange-600 hover:text-orange-800"
                    data-testid={`reset-password-${index}`}
                  >
                    <RefreshCw size={16} />
                    <span className="text-sm">Reset Password</span>
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersManagement;
