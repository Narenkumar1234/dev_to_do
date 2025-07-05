import React from 'react'
import { AlertTriangle, X, Trash2 } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  itemName: string
  itemType: 'task' | 'workspace'
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemType
}) => {
  const { currentTheme } = useTheme()

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getIcon = () => {
    return itemType === 'workspace' ? (
      <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 size={24} className="text-red-600" />
      </div>
    ) : (
      <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={24} className="text-red-600" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className={`${currentTheme.colors.background.card} rounded-2xl shadow-2xl p-6 w-full max-w-md border ${currentTheme.colors.border.light} transform transition-all duration-300 animate-modal-slide-in`}
        style={{ 
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {getIcon()}
            <h3 className={`text-xl font-semibold ${currentTheme.colors.text.primary} text-center mb-2`}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${currentTheme.colors.text.muted} hover:${currentTheme.colors.text.primary}`}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <p className={`${currentTheme.colors.text.secondary} text-sm mb-3`}>
            {message}
          </p>
          <div className={`bg-gradient-to-r ${currentTheme.colors.secondary.light} border ${currentTheme.colors.border.light} rounded-lg p-3`}>
            <p className={`font-medium ${currentTheme.colors.text.primary} text-sm`}>
              "{itemName}"
            </p>
          </div>
          <p className={`${currentTheme.colors.text.muted} text-xs mt-3`}>
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-3 rounded-xl border ${currentTheme.colors.border.light} ${currentTheme.colors.background.card} ${currentTheme.colors.text.secondary} hover:${currentTheme.colors.background.hover} transition-all duration-200 font-medium text-sm`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Delete {itemType === 'workspace' ? 'Workspace' : 'Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
