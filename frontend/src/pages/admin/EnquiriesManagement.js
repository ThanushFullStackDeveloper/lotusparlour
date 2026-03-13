import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Trash2, Check, Clock, Mail, Phone, User } from 'lucide-react';
import { getEnquiries, deleteEnquiry, api } from '../../utils/api';
import { toast } from 'sonner';

const EnquiriesManagement = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const response = await getEnquiries();
      setEnquiries(response.data);
    } catch (error) {
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/enquiries/${id}/status?status=read`);
      toast.success('Marked as read');
      fetchEnquiries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await deleteEnquiry(id);
        toast.success('Enquiry deleted');
        fetchEnquiries();
      } catch (error) {
        toast.error('Failed to delete enquiry');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading enquiries...</div>;
  }

  const unreadCount = enquiries.filter(e => e.status === 'unread').length;

  return (
    <div data-testid="enquiries-management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold">Contact Enquiries</h1>
          <p className="text-gray-600">
            {enquiries.length} total enquiries
            {unreadCount > 0 && <span className="text-orange-600 ml-2">({unreadCount} unread)</span>}
          </p>
        </div>
      </div>

      {enquiries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No enquiries yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enquiry, index) => (
            <motion.div
              key={enquiry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                enquiry.status === 'unread' ? 'border-l-4 border-orange-500' : ''
              }`}
              data-testid={`enquiry-${index}`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      enquiry.status === 'unread' ? 'bg-orange-100' : 'bg-green-100'
                    }`}>
                      <MessageSquare size={20} className={
                        enquiry.status === 'unread' ? 'text-orange-600' : 'text-green-600'
                      } />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-gray-400" />
                        <span className="font-semibold">{enquiry.name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <Mail size={14} />
                          <span>{enquiry.email}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Phone size={14} />
                          <span>{enquiry.phone}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      enquiry.status === 'unread' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {enquiry.status === 'unread' ? 'Unread' : 'Read'}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{formatDate(enquiry.created_at)}</span>
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{enquiry.message}</p>
                </div>

                <div className="flex justify-end space-x-2">
                  {enquiry.status === 'unread' && (
                    <button
                      onClick={() => handleMarkAsRead(enquiry.id)}
                      className="flex items-center space-x-1 px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      data-testid={`mark-read-${index}`}
                    >
                      <Check size={16} />
                      <span>Mark as Read</span>
                    </button>
                  )}
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="flex items-center space-x-1 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Mail size={16} />
                    <span>Reply</span>
                  </a>
                  <button
                    onClick={() => handleDelete(enquiry.id)}
                    className="flex items-center space-x-1 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    data-testid={`delete-enquiry-${index}`}
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnquiriesManagement;
