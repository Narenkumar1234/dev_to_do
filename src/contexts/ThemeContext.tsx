import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Theme {
  name: string
  displayName: string
  colors: {
    primary: {
      from: string
      to: string
      text: string
      light: string
      dark: string
    }
    secondary: {
      from: string
      to: string
      text: string
      light: string
      dark: string
    }
    background: {
      main: string
      panel: string
      card: string
      hover: string
    }
    text: {
      primary: string
      secondary: string
      muted: string
    }
    border: {
      light: string
      medium: string
      dark: string
    }
    status: {
      success: string
      warning: string
      error: string
    }
  }
}

export const themes: Record<string, Theme> = {
  default: {
    name: 'default',
    displayName: 'Ocean Blue',
    colors: {
      primary: {
        from: 'from-blue-500',
        to: 'to-purple-600',
        text: 'text-blue-600',
        light: 'bg-blue-50',
        dark: 'bg-blue-600'
      },
      secondary: {
        from: 'from-emerald-500',
        to: 'to-teal-600',
        text: 'text-emerald-600',
        light: 'bg-emerald-50',
        dark: 'bg-emerald-600'
      },
      background: {
        main: 'bg-gradient-to-br from-slate-50 via-white to-gray-50/30',
        panel: 'bg-gradient-to-br from-slate-50 to-white',
        card: 'bg-white',
        hover: 'hover:bg-white'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        muted: 'text-gray-500'
      },
      border: {
        light: 'border-gray-200/60',
        medium: 'border-gray-300',
        dark: 'border-gray-400'
      },
      status: {
        success: 'text-emerald-600',
        warning: 'text-yellow-600',
        error: 'text-red-600'
      }
    }
  },
  sunset: {
    name: 'sunset',
    displayName: 'Sunset Orange',
    colors: {
      primary: {
        from: 'from-orange-500',
        to: 'to-red-600',
        text: 'text-orange-600',
        light: 'bg-orange-50',
        dark: 'bg-orange-600'
      },
      secondary: {
        from: 'from-amber-500',
        to: 'to-orange-600',
        text: 'text-amber-600',
        light: 'bg-amber-50',
        dark: 'bg-amber-600'
      },
      background: {
        main: 'bg-gradient-to-br from-orange-50 via-white to-red-50/30',
        panel: 'bg-gradient-to-br from-orange-50 to-white',
        card: 'bg-white',
        hover: 'hover:bg-white'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        muted: 'text-gray-500'
      },
      border: {
        light: 'border-orange-200/60',
        medium: 'border-orange-300',
        dark: 'border-orange-400'
      },
      status: {
        success: 'text-emerald-600',
        warning: 'text-amber-600',
        error: 'text-red-600'
      }
    }
  },
  forest: {
    name: 'forest',
    displayName: 'Forest Green',
    colors: {
      primary: {
        from: 'from-green-500',
        to: 'to-emerald-600',
        text: 'text-green-600',
        light: 'bg-green-50',
        dark: 'bg-green-600'
      },
      secondary: {
        from: 'from-teal-500',
        to: 'to-green-600',
        text: 'text-teal-600',
        light: 'bg-teal-50',
        dark: 'bg-teal-600'
      },
      background: {
        main: 'bg-gradient-to-br from-green-50 via-white to-emerald-50/30',
        panel: 'bg-gradient-to-br from-green-50 to-white',
        card: 'bg-white',
        hover: 'hover:bg-white'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        muted: 'text-gray-500'
      },
      border: {
        light: 'border-green-200/60',
        medium: 'border-green-300',
        dark: 'border-green-400'
      },
      status: {
        success: 'text-green-600',
        warning: 'text-yellow-600',
        error: 'text-red-600'
      }
    }
  },
  lavender: {
    name: 'lavender',
    displayName: 'Lavender Purple',
    colors: {
      primary: {
        from: 'from-purple-500',
        to: 'to-indigo-600',
        text: 'text-purple-600',
        light: 'bg-purple-50',
        dark: 'bg-purple-600'
      },
      secondary: {
        from: 'from-violet-500',
        to: 'to-purple-600',
        text: 'text-violet-600',
        light: 'bg-violet-50',
        dark: 'bg-violet-600'
      },
      background: {
        main: 'bg-gradient-to-br from-purple-50 via-white to-indigo-50/30',
        panel: 'bg-gradient-to-br from-purple-50 to-white',
        card: 'bg-white',
        hover: 'hover:bg-white'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        muted: 'text-gray-500'
      },
      border: {
        light: 'border-purple-200/60',
        medium: 'border-purple-300',
        dark: 'border-purple-400'
      },
      status: {
        success: 'text-emerald-600',
        warning: 'text-yellow-600',
        error: 'text-red-600'
      }
    }
  },
  rose: {
    name: 'rose',
    displayName: 'Rose Pink',
    colors: {
      primary: {
        from: 'from-rose-500',
        to: 'to-pink-600',
        text: 'text-rose-600',
        light: 'bg-rose-50',
        dark: 'bg-rose-600'
      },
      secondary: {
        from: 'from-pink-500',
        to: 'to-rose-600',
        text: 'text-pink-600',
        light: 'bg-pink-50',
        dark: 'bg-pink-600'
      },
      background: {
        main: 'bg-gradient-to-br from-rose-50 via-white to-pink-50/30',
        panel: 'bg-gradient-to-br from-rose-50 to-white',
        card: 'bg-white',
        hover: 'hover:bg-white'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        muted: 'text-gray-500'
      },
      border: {
        light: 'border-rose-200/60',
        medium: 'border-rose-300',
        dark: 'border-rose-400'
      },
      status: {
        success: 'text-emerald-600',
        warning: 'text-yellow-600',
        error: 'text-red-600'
      }
    }
  },
  midnight: {
    name: 'midnight',
    displayName: 'Midnight Dark',
    colors: {
      primary: {
        from: 'from-slate-600',
        to: 'to-gray-800',
        text: 'text-slate-300',
        light: 'bg-slate-800',
        dark: 'bg-slate-900'
      },
      secondary: {
        from: 'from-gray-600',
        to: 'to-slate-800',
        text: 'text-gray-300',
        light: 'bg-gray-800',
        dark: 'bg-gray-900'
      },
      background: {
        main: 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800',
        panel: 'bg-gradient-to-br from-slate-800 to-gray-900',
        card: 'bg-slate-800',
        hover: 'hover:bg-slate-700'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        muted: 'text-gray-400'
      },
      border: {
        light: 'border-slate-700/60',
        medium: 'border-slate-600',
        dark: 'border-slate-500'
      },
      status: {
        success: 'text-emerald-400',
        warning: 'text-yellow-400',
        error: 'text-red-400'
      }
    }
  }
}

interface ThemeContextType {
  currentTheme: Theme
  changeTheme: (themeName: string) => void
  availableThemes: Theme[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentThemeName, setCurrentThemeName] = useState<string>('default')

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme')
    if (savedTheme && themes[savedTheme]) {
      setCurrentThemeName(savedTheme)
    }
  }, [])

  const changeTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentThemeName(themeName)
      localStorage.setItem('app-theme', themeName)
    }
  }

  const value: ThemeContextType = {
    currentTheme: themes[currentThemeName],
    changeTheme,
    availableThemes: Object.values(themes)
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
