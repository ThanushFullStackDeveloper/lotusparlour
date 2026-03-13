import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { getAllVideos, createVideo, updateVideo, deleteVideo } from '../../utils/api';
import { toast } from 'sonner';

const VideosManagement = () => {
  const [videos, setVideos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    category: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await getAllVideos();
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVideo) {
        await updateVideo(editingVideo.id, formData);
        toast.success('Video updated successfully');
      } else {
        await createVideo(formData);
        toast.success('Video added successfully');
      }
      fetchVideos();
      resetForm();
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Failed to save video');
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      youtube_url: video.youtube_url,
      category: video.category,
      is_active: video.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await deleteVideo(id);
        toast.success('Video deleted');
        fetchVideos();
      } catch (error) {
        console.error('Error deleting video:', error);
        toast.error('Failed to delete video');
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', youtube_url: '', category: '', is_active: true });
    setEditingVideo(null);
    setShowModal(false);
  };

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getThumbnail = (url) => {
    const videoId = getYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://via.placeholder.com/480x360';
  };

  if (loading) {
    return <div className="text-center py-12">Loading videos...</div>;
  }

  return (
    <div data-testid="videos-management">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold font-heading mb-2">Videos Management</h1>
          <p className="text-gray-600">Add and manage service demonstration videos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2" data-testid="add-video-btn">
          <Plus size={20} />
          <span>Add Video</span>
        </button>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all"
            data-testid={`video-card-${index}`}
          >
            <div className="relative">
              <img src={getThumbnail(video.youtube_url)} alt={video.title} className="w-full h-48 object-cover" />
              <div className="absolute top-3 right-3 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  video.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {video.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--secondary)] text-white">
                  {video.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 line-clamp-1">{video.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(video)} className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1" data-testid={`edit-video-${index}`}>
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
                <button onClick={() => handleDelete(video.id)} className="flex-1 py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-1" data-testid={`delete-video-${index}`}>
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="video-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingVideo ? 'Edit Video' : 'Add Video'}</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700" data-testid="close-modal">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Bridal Makeup Tutorial" data-testid="video-title-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">YouTube URL *</label>
                <input type="url" name="youtube_url" value={formData.youtube_url} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" placeholder="https://www.youtube.com/watch?v=..." data-testid="video-url-input" />
                <p className="text-xs text-gray-500 mt-1">Paste the full YouTube video link</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" data-testid="video-category-select">
                  <option value="">Select Category</option>
                  <option value="Bridal">Bridal</option>
                  <option value="Hair">Hair</option>
                  <option value="Facial">Facial</option>
                  <option value="Makeup">Makeup</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" className="w-full px-4 py-2 border rounded-lg" placeholder="Brief description of the video" data-testid="video-description-input"></textarea>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4" data-testid="video-active-checkbox" />
                <label className="text-sm font-medium">Active (visible on website)</label>
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={resetForm} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50" data-testid="cancel-video-btn">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary" data-testid="save-video-btn">
                  {editingVideo ? 'Update' : 'Add Video'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VideosManagement;
