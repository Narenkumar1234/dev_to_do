import React, { useState } from 'react';
import { User, LogOut, Settings, Edit3, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const UserProfile: React.FC = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const { currentTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) return;
    
    setLoading(true);
    try {
      await updateUserProfile(displayName.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setDisplayName(user?.displayName || '');
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="relative z-30">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-opacity-80"
        style={{ 
          backgroundColor: currentTheme.colors.background.hover,
          color: currentTheme.colors.text.primary
        }}
      >
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${currentTheme.colors.primary.from}, ${currentTheme.colors.primary.to})`
          }}
        >
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        <span className="text-sm font-medium hidden sm:block">
          {user.displayName || user.email?.split('@')[0]}
        </span>
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-[55]"
            onClick={() => setShowDropdown(false)}
          />
          <div 
            className="absolute right-0 top-full mt-2 w-80 rounded-lg shadow-2xl border z-[60] p-4"
            style={{ 
              backgroundColor: currentTheme.colors.background.panel,
              borderColor: currentTheme.colors.border.medium,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Profile Header */}
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${currentTheme.colors.primary.from}, ${currentTheme.colors.primary.to})`
                }}
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1 px-2 py-1 rounded border text-sm"
                      style={{ 
                        backgroundColor: currentTheme.colors.background.card,
                        borderColor: currentTheme.colors.border.light,
                        color: currentTheme.colors.text.primary
                      }}
                      placeholder="Display name"
                    />
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="p-1 rounded transition-colors"
                      style={{ color: currentTheme.colors.status.success }}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 rounded transition-colors"
                      style={{ color: currentTheme.colors.status.error }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: currentTheme.colors.text.primary }}>
                        {user.displayName || 'Anonymous User'}
                      </p>
                      <p className="text-sm truncate" style={{ color: currentTheme.colors.text.muted }}>
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 rounded transition-colors flex-shrink-0"
                      style={{ color: currentTheme.colors.text.muted }}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div 
              className="h-px mb-4"
              style={{ backgroundColor: currentTheme.colors.border.light }}
            />

            {/* Menu Items */}
            <div className="space-y-2">
              <button
                className="w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left"
                style={{ 
                  color: currentTheme.colors.text.primary,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = currentTheme.colors.background.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left"
                style={{ 
                  color: currentTheme.colors.status.error,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = currentTheme.colors.background.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;
