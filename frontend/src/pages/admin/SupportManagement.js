import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, CheckCircle, X } from 'lucide-react';
import { getSupportRequests, updateSupportStatus, deleteSupportRequest } from '../../utils/api';
import { toast } from 'sonner';

const SupportManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await getSupportRequests();
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load support requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateSupportStatus(id, status);
      toast.success(`Status updated to ${status}`);
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this support request?')) {
      try {
        await deleteSupportRequest(id);
        toast.success('Request deleted');
        fetchRequests();
      } catch (error) {
        toast.error('Failed to delete request');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading support requests...</div>;
  }

  return (
    <div data-testid="support-management">
      <h1 className="text-4xl font-bold mb-6">Customer Support</h1>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No support requests</p>
          </div>
        ) : (
          requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white p-6 rounded-xl shadow-sm border-2 ${
                request.status === 'resolved' ? 'border-green-200' : 'border-yellow-200'
              }`}
              data-testid={`support-request-${index}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{request.name}</h3>
                  <p className="text-sm text-gray-600">{request.email} | {request.phone}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  request.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {request.status}
                </span>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium mb-1">Problem:</p>
                <p className="text-sm text-gray-700">{request.problem}</p>
              </div>
              <div className="flex space-x-2">
                {request.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(request.id, 'resolved')}
                    className="flex items-center space-x-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                    data-testid={`resolve-request-${index}`}
                  >
                    <CheckCircle size={16} />
                    <span>Mark Resolved</span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(request.id)}
                  className="flex items-center space-x-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  data-testid={`delete-request-${index}`}
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SupportManagement;
