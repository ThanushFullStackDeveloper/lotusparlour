import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { getStaff, createStaff, updateStaff, deleteStaff, uploadImage } from '../../utils/api';
import { invalidateCache } from '../../utils/cacheManager';
import { toast } from 'sonner';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    experience: '',
    specialization: '',
    photo: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await getStaff();
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let photoUrl = formData.photo;
      if (imageFile) {
        const uploadRes = await uploadImage(imageFile);
        photoUrl = uploadRes.data.url;
      }

      const staffData = { ...formData, photo: photoUrl };

      if (editingStaff) {
        await updateStaff(editingStaff.id, staffData);
        toast.success('Staff updated successfully');
      } else {
        await createStaff(staffData);
        toast.success('Staff member added successfully');
      }

      await invalidateCache('staff');
      fetchStaff();
      resetForm();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error('Failed to save staff member');
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      role: member.role,
      experience: member.experience,
      specialization: member.specialization,
      photo: member.photo || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(id);
        toast.success('Staff member deleted');
        await invalidateCache('staff');
        fetchStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
        toast.error('Failed to delete staff member');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', role: '', experience: '', specialization: '', photo: '' });
    setImageFile(null);
    setEditingStaff(null);
    setShowModal(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading staff...</div>;
  }

  return (
    <div data-testid="staff-management">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold font-heading mb-2">Staff Management</h1>
          <p className="text-gray-600">Manage your team members</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2" data-testid="add-staff-btn">
          <Plus size={20} />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Staff Grid - Bigger cards with fitted images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {staff.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all"
            data-testid={`staff-card-${index}`}
          >
            <div className="aspect-[3/4] w-full overflow-hidden">
              <img 
                src={member.photo || 'https://via.placeholder.com/300x400'} 
                alt={member.name} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
              <p className="text-sm mb-2" style={{ color: 'var(--secondary)' }}>{member.role}</p>
              <p className="text-xs text-gray-600 mb-1">Experience: {member.experience}</p>
              <p className="text-xs text-gray-600 mb-4 line-clamp-2">{member.specialization}</p>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(member)} className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1" data-testid={`edit-staff-${index}`}>
                  <Edit2 size={14} />
                  <span className="text-sm">Edit</span>
                </button>
                <button onClick={() => handleDelete(member.id)} className="flex-1 py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-1" data-testid={`delete-staff-${index}`}>
                  <Trash2 size={14} />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="staff-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700" data-testid="close-modal">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" data-testid="staff-name-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role *</label>
                <input type="text" name="role" value={formData.role} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Senior Makeup Artist" data-testid="staff-role-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Experience *</label>
                <input type="text" name="experience" value={formData.experience} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., 10 years" data-testid="staff-experience-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Specialization *</label>
                <textarea name="specialization" value={formData.specialization} onChange={handleChange} required rows="3" className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Bridal makeup, HD makeup" data-testid="staff-specialization-input"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Photo</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 border rounded-lg" data-testid="staff-photo-input" />
                {formData.photo && !imageFile && (
                  <img src={formData.photo} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                )}
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={resetForm} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50" data-testid="cancel-staff-btn">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary" data-testid="save-staff-btn">
                  {editingStaff ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
