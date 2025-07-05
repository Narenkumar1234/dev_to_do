import React, { useState } from 'react'
import { Palette, Check } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, changeTheme, availableThemes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const handleThemeChange = (themeName: string) => {
    changeTheme(themeName)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-all duration-200 ${
          currentTheme.colors.background.card
        } ${
          currentTheme.colors.border.light
        } border ${
          currentTheme.colors.text.secondary
        } hover:shadow-md hover:${currentTheme.colors.border.medium}`}
        title={`Current theme: ${currentTheme.displayName}`}
      >
        <Palette size={18} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={`absolute top-full left-0 mt-2 w-64 ${
            currentTheme.colors.background.card
          } ${
            currentTheme.colors.border.light
          } border rounded-xl shadow-xl z-50 p-2`}>
            <div className="mb-2">
              <h3 className={`text-sm font-semibold px-3 py-1 ${currentTheme.colors.text.primary}`}>
                Choose Theme
              </h3>
            </div>
            
            <div className="space-y-1">
              {availableThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    theme.name === currentTheme.name
                      ? `${currentTheme.colors.primary.light} ${currentTheme.colors.primary.text}`
                      : `${currentTheme.colors.text.secondary} hover:${currentTheme.colors.background.hover}`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.colors.primary.from} ${theme.colors.primary.to} shadow-sm`} />
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${theme.colors.secondary.from} ${theme.colors.secondary.to} shadow-sm`} />
                  </div>
                  
                  <span className="flex-1 text-left text-sm font-medium">
                    {theme.displayName}
                  </span>
                  
                  {theme.name === currentTheme.name && (
                    <Check size={16} className={currentTheme.colors.primary.text} />
                  )}
                </button>
              ))}
            </div>
            
            <div className={`mt-2 pt-2 border-t ${currentTheme.colors.border.light}`}>
              <p className={`text-xs ${currentTheme.colors.text.muted} px-3 py-1`}>
                Theme preferences are saved automatically
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ThemeSwitcher
