import React, { useState } from 'react';
import { User, LogOut, Edit3, Check, X } from 'lucide-react';
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
        className="flex items-center gap-2 p-2 rounded-lg transition-all duration-200 hover:bg-opacity-80 hover:scale-105"
        style={{ 
          backgroundColor: currentTheme.colors.background.hover,
          color: currentTheme.colors.text.primary,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
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
            className="absolute right-0 bg-white top-full mt-2 w-80 rounded-xl shadow-2xl border z-[60] p-6"
            style={{ 
              backgroundColor: currentTheme.colors.background.panel,
              borderColor: currentTheme.colors.border.medium,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="rounded-full flex items-center justify-center shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${currentTheme.colors.primary.from}, ${currentTheme.colors.primary.to})`
                }}
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className=" rounded-full object-cover"
                  />
                ) : (
                  <User className="w-7 h-7 text-white" />
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
              className="h-px mb-6 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
              style={{ color: currentTheme.colors.border.medium }}
            />

            {/* Menu Items */}
            <div className="space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left group"
                style={{ 
                  color: currentTheme.colors.status.error,
                  backgroundColor: 'transparent',
                  border: `1px solid ${currentTheme.colors.border.light}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = currentTheme.colors.status.error;
                  e.currentTarget.style.color = 'black';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = currentTheme.colors.status.error;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;
