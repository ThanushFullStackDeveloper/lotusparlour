import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { getGallery, createGalleryImage, deleteGalleryImage, uploadImage } from '../../utils/api';
import { toast } from 'sonner';

const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await getGallery();
      setImages(response.data);
    } catch (error) {
      toast.error('Failed to load gallery');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile || !category) {
      toast.error('Please select image and category');
      return;
    }

    try {
      const uploadRes = await uploadImage(imageFile);
      await createGalleryImage({ category, image: uploadRes.data.url });
      toast.success('Image uploaded successfully');
      fetchGallery();
      setCategory('');
      setImageFile(null);
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this image?')) {
      try {
        await deleteGalleryImage(id);
        toast.success('Image deleted');
        fetchGallery();
      } catch (error) {
        toast.error('Failed to delete image');
      }
    }
  };

  return (
    <div data-testid="gallery-management">
      <h1 className="text-4xl font-bold mb-6">Gallery Management</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <form onSubmit={handleUpload} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 border rounded-lg" data-testid="category-select">
              <option value="">Select Category</option>
              <option value="Bridal Makeup">Bridal Makeup</option>
              <option value="Hair Styling">Hair Styling</option>
              <option value="Facial">Facial</option>
              <option value="Salon Interior">Salon Interior</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full px-4 py-2 border rounded-lg" data-testid="image-input" />
          </div>
          <button type="submit" className="btn-primary flex items-center space-x-2" data-testid="upload-btn">
            <Plus size={20} />
            <span>Upload</span>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <motion.div key={img.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative group" data-testid={`gallery-item-${index}`}>
            <img src={img.image} alt={img.category} className="w-full h-48 object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
              <button onClick={() => handleDelete(img.id)} className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-lg" data-testid={`delete-image-${index}`}>
                <Trash2 size={20} />
              </button>
            </div>
            <p className="text-xs mt-2 text-center">{img.category}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GalleryManagement;
