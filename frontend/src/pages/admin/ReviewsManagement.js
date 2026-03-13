import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Star, X } from 'lucide-react';
import { getAllReviews, createReview, deleteReview } from '../../utils/api';
import { toast } from 'sonner';

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ customer_name: '', rating: 5, review_text: '' });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await getAllReviews();
      setReviews(response.data);
    } catch (error) {
      toast.error('Failed to load reviews');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createReview(formData);
      toast.success('Review added successfully');
      fetchReviews();
      setShowModal(false);
      setFormData({ customer_name: '', rating: 5, review_text: '' });
    } catch (error) {
      toast.error('Failed to add review');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this review?')) {
      try {
        await deleteReview(id);
        toast.success('Review deleted');
        fetchReviews();
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  return (
    <div data-testid="reviews-management">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Reviews Management</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2" data-testid="add-review-btn">
          <Plus size={20} />
          <span>Add Review</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review, index) => (
          <motion.div key={review.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-xl shadow-sm" data-testid={`review-card-${index}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--secondary)" color="var(--secondary)" />
                ))}
              </div>
              <button onClick={() => handleDelete(review.id)} className="text-red-500 hover:text-red-700" data-testid={`delete-review-${index}`}>
                <Trash2 size={18} />
              </button>
            </div>
            <p className="text-sm italic mb-2">"{review.review_text}"</p>
            <p className="text-sm font-semibold">- {review.customer_name}</p>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="review-modal">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add Review</h2>
              <button onClick={() => setShowModal(false)} data-testid="close-modal"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Customer Name *</label>
                <input type="text" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} required className="w-full px-4 py-2 border rounded-lg" data-testid="customer-name-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rating *</label>
                <select value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-lg" data-testid="rating-select">
                  {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Review Text *</label>
                <textarea value={formData.review_text} onChange={(e) => setFormData({ ...formData, review_text: e.target.value })} required rows="4" className="w-full px-4 py-2 border rounded-lg" data-testid="review-text-input"></textarea>
              </div>
              <button type="submit" className="btn-primary w-full" data-testid="save-review-btn">Add Review</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReviewsManagement;
