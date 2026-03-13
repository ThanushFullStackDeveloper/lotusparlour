import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { getCoupons, createCoupon, deleteCoupon } from '../../utils/api';
import { toast } from 'sonner';

const CouponsManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({ code: '', discount_percent: '', valid_until: '' });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await getCoupons();
      setCoupons(response.data);
    } catch (error) {
      toast.error('Failed to load coupons');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, discount_percent: parseFloat(formData.discount_percent) };
      await createCoupon(data);
      toast.success('Coupon created');
      fetchCoupons();
      setFormData({ code: '', discount_percent: '', valid_until: '' });
    } catch (error) {
      toast.error('Failed to create coupon');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this coupon?')) {
      try {
        await deleteCoupon(id);
        toast.success('Coupon deleted');
        fetchCoupons();
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  return (
    <div data-testid="coupons-management">
      <h1 className="text-4xl font-bold mb-6">Coupons Management</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Coupon Code *</label>
            <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required className="w-full px-4 py-2 border rounded-lg" placeholder="SAVE20" data-testid="code-input" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-2">Discount % *</label>
            <input type="number" value={formData.discount_percent} onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })} required className="w-full px-4 py-2 border rounded-lg" data-testid="discount-input" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Valid Until *</label>
            <input type="date" value={formData.valid_until} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })} required className="w-full px-4 py-2 border rounded-lg" data-testid="valid-until-input" />
          </div>
          <button type="submit" className="btn-primary flex items-center space-x-2" data-testid="add-coupon-btn">
            <Plus size={20} />
            <span>Create</span>
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full" data-testid="coupons-table">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map((coupon, index) => (
              <motion.tr key={coupon.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid={`coupon-row-${index}`}>
                <td className="px-6 py-4 font-mono font-bold">{coupon.code}</td>
                <td className="px-6 py-4">{coupon.discount_percent}%</td>
                <td className="px-6 py-4">{coupon.valid_until}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:text-red-700" data-testid={`delete-coupon-${index}`}>
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

export default CouponsManagement;
