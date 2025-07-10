import React from 'react';
import { Cloud, CloudOff, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useSaveStatus } from '../contexts/SaveStatusContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const SaveStatusIndicator: React.FC = () => {
  const { status, lastSaved, hasUnsavedChanges, triggerManualSave } = useSaveStatus();
  const { user } = useAuth();
  const { currentTheme } = useTheme();

  // Don't show for non-authenticated users
  if (!user) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <CloudOff size={14} />
        <span>Local only</span>
      </div>
    );
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 size={14} className="animate-spin" />,
          text: 'Saving to cloud...',
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          clickable: false
        };
      case 'saved':
        return {
          icon: <CheckCircle size={14} />,
          text: hasUnsavedChanges ? 'Saved locally • Click to sync' : 'Synced to cloud',
          color: hasUnsavedChanges ? 'text-orange-500' : 'text-green-500',
          bgColor: hasUnsavedChanges ? 'bg-orange-50' : 'bg-green-50',
          clickable: hasUnsavedChanges
        };
      case 'unsaved':
        return {
          icon: <Save size={14} />,
          text: 'Unsaved changes • Click to save',
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
          clickable: true
        };
      case 'error':
        return {
          icon: <AlertCircle size={14} />,
          text: 'Save failed • Click to retry',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          clickable: true
        };
      default:
        return {
          icon: <Cloud size={14} />,
          text: 'Ready',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          clickable: false
        };
    }
  };

  const config = getStatusConfig();
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcut = isMac ? '⌘S' : 'Ctrl+S';

  const handleClick = () => {
    if (config.clickable) {
      triggerManualSave();
    }
  };

  return (
    <div 
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bgColor} ${config.color} transition-all duration-200 ${
        config.clickable ? 'cursor-pointer hover:opacity-80' : ''
      }`}
      onClick={handleClick}
      title={config.clickable ? `Click or press ${shortcut} to save` : undefined}
    >
      {config.icon}
      <span className="text-xs font-medium">{config.text}</span>
      {(status === 'unsaved' || hasUnsavedChanges) && (
        <span className="text-xs opacity-75">({shortcut})</span>
      )}
      {lastSaved && status === 'saved' && !hasUnsavedChanges && (
        <span className="text-xs opacity-75">
          {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
};

export default SaveStatusIndicator;
