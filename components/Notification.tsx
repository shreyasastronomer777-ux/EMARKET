import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  isVisible: boolean;
}

export const Notification: React.FC<NotificationProps> = ({ message, type = 'success', onClose, isVisible }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${type === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
        {type === 'success' ? (
          <CheckCircle className="text-emerald-500" size={20} />
        ) : (
          <XCircle className="text-red-500" size={20} />
        )}
        
        <p className={`text-sm font-medium ${type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
          {message}
        </p>

        <button onClick={onClose} className={`ml-2 p-1 rounded-full hover:bg-black/5 ${type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
