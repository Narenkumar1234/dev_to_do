import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Cloud, CloudOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'sync';
  message: string;
  duration?: number;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, duration = 5000, onClose }) => {
  const { currentTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'sync':
        return <Cloud className="w-5 h-5 text-blue-500" />;
      default:
        return <CloudOff className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'sync':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      } ${getBackgroundColor()}`}
      style={{ maxWidth: '400px' }}
    >
      <div className="flex items-center gap-3">
        {getIcon()}
        <p className="text-sm font-medium" style={{ color: currentTheme.colors.text.primary }}>
          {message}
        </p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Notification;
