import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { getHolidays, createHoliday, deleteHoliday } from '../../utils/api';
import { toast } from 'sonner';

const HolidaysManagement = () => {
  const [holidays, setHolidays] = useState([]);
  const [formData, setFormData] = useState({ date: '', reason: '' });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await getHolidays();
      setHolidays(response.data);
    } catch (error) {
      toast.error('Failed to load holidays');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createHoliday(formData);
      toast.success('Holiday added');
      fetchHolidays();
      setFormData({ date: '', reason: '' });
    } catch (error) {
      toast.error('Failed to add holiday');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this holiday?')) {
      try {
        await deleteHoliday(id);
        toast.success('Holiday deleted');
        fetchHolidays();
      } catch (error) {
        toast.error('Failed to delete holiday');
      }
    }
  };

  return (
    <div data-testid="holidays-management">
      <h1 className="text-4xl font-bold mb-6">Holidays Management</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Date *</label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required className="w-full px-4 py-2 border rounded-lg" data-testid="date-input" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Reason *</label>
            <input type="text" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Public Holiday" data-testid="reason-input" />
          </div>
          <button type="submit" className="btn-primary flex items-center space-x-2" data-testid="add-holiday-btn">
            <Plus size={20} />
            <span>Add</span>
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full" data-testid="holidays-table">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {holidays.map((holiday, index) => (
              <motion.tr key={holiday.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid={`holiday-row-${index}`}>
                <td className="px-6 py-4 font-medium">{holiday.date}</td>
                <td className="px-6 py-4">{holiday.reason}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(holiday.id)} className="text-red-500 hover:text-red-700" data-testid={`delete-holiday-${index}`}>
                    <Trash2 size={18} />
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

export default HolidaysManagement;
