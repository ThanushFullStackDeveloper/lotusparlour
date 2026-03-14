import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { getServicesFull, createService, updateService, deleteService, uploadImage } from '../../utils/api';
import { invalidateCache } from '../../utils/cacheManager';
import { toast } from 'sonner';

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discount_price: '',
    duration: '',
    description: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await getServicesFull();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validate discount price
    if (name === 'discount_price' || name === 'price') {
      const price = name === 'price' ? parseFloat(value) : parseFloat(formData.price);
      const discountPrice = name === 'discount_price' ? parseFloat(value) : parseFloat(formData.discount_price);
      
      if (discountPrice && discountPrice >= price) {
        setPriceError('Discount price must be less than original price');
      } else if (discountPrice && discountPrice < 0) {
        setPriceError('Discount price cannot be negative');
      } else {
        setPriceError('');
      }
    }
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate discount price before submit
    if (formData.discount_price && parseFloat(formData.discount_price) >= parseFloat(formData.price)) {
      toast.error('Discount price must be less than original price');
      return;
    }
    if (formData.discount_price && parseFloat(formData.discount_price) < 0) {
      toast.error('Discount price cannot be negative');
      return;
    }
    
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        const uploadRes = await uploadImage(imageFile);
        imageUrl = uploadRes.data.url;
      }

      const serviceData = { 
        ...formData, 
        price: parseFloat(formData.price), 
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        duration: parseInt(formData.duration), 
        image: imageUrl 
      };

      if (editingService) {
        await updateService(editingService.id, serviceData);
        toast.success('Service updated successfully');
      } else {
        await createService(serviceData);
        toast.success('Service created successfully');
      }

      // Invalidate services cache so PWA users get updated data
      await invalidateCache('services');
      
      fetchServices();
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price,
      discount_price: service.discount_price || '',
      duration: service.duration,
      description: service.description,
      image: service.image || '',
    });
    setPriceError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(id);
        toast.success('Service deleted');
        await invalidateCache('services');
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', discount_price: '', duration: '', description: '', image: '' });
    setImageFile(null);
    setEditingService(null);
    setShowModal(false);
    setPriceError('');
  };

  if (loading) {
    return <div className="text-center py-12">Loading services...</div>;
  }

  return (
    <div data-testid="services-management">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold font-heading mb-2">Services Management</h1>
          <p className="text-gray-600">Add, edit, or remove beauty services</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2" data-testid="add-service-btn">
          <Plus size={20} />
          <span>Add Service</span>
        </button>
      </div>

      {/* Services Grid - Bigger cards with fitted images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all"
            data-testid={`service-card-${index}`}
          >
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img 
                src={service.image || 'https://via.placeholder.com/400x300'} 
                alt={service.name} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold mb-2 truncate">{service.name}</h3>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  {service.discount_price ? (
                    <>
                      <span className="text-sm text-gray-400 line-through">₹{service.price}</span>
                      <span className="text-lg font-bold text-green-600">₹{service.discount_price}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold" style={{ color: 'var(--secondary)' }}>₹{service.price}</span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{service.duration} mins</span>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(service)} className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1" data-testid={`edit-service-${index}`}>
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button onClick={() => handleDelete(service.id)} className="flex-1 py-2 px-3 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors flex items-center justify-center space-x-1" data-testid={`delete-service-${index}`}>
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="service-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingService ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700" data-testid="close-modal">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Service Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" data-testid="service-name-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required min="1" className="w-full px-4 py-2 border rounded-lg" data-testid="service-price-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Price (₹)</label>
                  <input 
                    type="number" 
                    name="discount_price" 
                    value={formData.discount_price} 
                    onChange={handleChange} 
                    min="0"
                    placeholder="Optional"
                    className={`w-full px-4 py-2 border rounded-lg ${priceError ? 'border-red-500' : ''}`} 
                    data-testid="service-discount-price-input" 
                  />
                </div>
              </div>
              {priceError && (
                <p className="text-red-500 text-sm">{priceError}</p>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
                <input type="number" name="duration" value={formData.duration} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" data-testid="service-duration-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" className="w-full px-4 py-2 border rounded-lg" data-testid="service-description-input"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 border rounded-lg" data-testid="service-image-input" />
                {formData.image && !imageFile && (
                  <img src={formData.image} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                )}
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={resetForm} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50" data-testid="cancel-service-btn">
                  Cancel
                </button>
                <button type="submit" disabled={!!priceError} className={`flex-1 btn-primary ${priceError ? 'opacity-50 cursor-not-allowed' : ''}`} data-testid="save-service-btn">
                  {editingService ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;
