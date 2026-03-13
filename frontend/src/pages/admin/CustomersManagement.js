import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Trash2, RefreshCw, X, Save, Eye, EyeOff } from 'lucide-react';
import { getCustomers, adminResetCustomerPassword, deleteCustomer, updateCustomer } from '../../utils/api';
import { toast } from 'sonner';

const CustomersManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleDeleteCustomer = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        await deleteCustomer(userId);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer({
      ...customer,
      new_password: ''
    });
    setShowPassword(false);
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: editingCustomer.name,
        email: editingCustomer.email,
        phone: editingCustomer.phone
      };
      if (editingCustomer.new_password) {
        updateData.password = editingCustomer.new_password;
      }
      await updateCustomer(editingCustomer.id, updateData);
      toast.success('Customer updated successfully');
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : 'Failed to update customer';
      toast.error(errorMsg);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.includes(query)
    );
  });

  if (loading) {
    return <div className="text-center py-12">Loading customers...</div>;
  }

  return (
    <div data-testid="customers-management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold">Customer Management</h1>
          <p className="text-gray-600">{customers.length} total customers</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
            data-testid="customer-search-input"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full" data-testid="customers-table">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  {searchQuery ? 'No customers found matching your search' : 'No customers yet'}
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer, index) => (
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
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="Edit Customer"
                        data-testid={`edit-customer-${index}`}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleResetPassword(customer.id, customer.name)}
                        className="p-1.5 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded"
                        title="Reset Password"
                        data-testid={`reset-password-${index}`}
                      >
                        <RefreshCw size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        title="Delete Customer"
                        data-testid={`delete-customer-${index}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="edit-customer-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Customer</h2>
              <button 
                onClick={() => setEditingCustomer(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editingCustomer.name || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  data-testid="edit-customer-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editingCustomer.email || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  data-testid="edit-customer-email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={editingCustomer.phone || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  data-testid="edit-customer-phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New Password (leave blank to keep current)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editingCustomer.new_password || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, new_password: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border rounded-lg"
                    placeholder="Enter new password"
                    data-testid="edit-customer-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  data-testid="save-customer-btn"
                >
                  <Save size={18} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CustomersManagement;
