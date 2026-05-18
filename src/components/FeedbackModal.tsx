import React, { useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FeedbackModalProps {
  onClose: () => void;
  onSubmit: (data: { subject: string; message: string }) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose, onSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Send Feedback
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">From</label>
            <input 
              disabled
              type="text" 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              value={user?.name || 'Guest'}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Schedule Error, Suggestion"
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
            <textarea 
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="How can we help you?"
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
