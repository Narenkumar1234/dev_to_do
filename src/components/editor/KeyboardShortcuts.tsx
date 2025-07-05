import React, { useState } from 'react'
import { Keyboard, X } from 'lucide-react'

interface KeyboardShortcutsProps {
  show: boolean
  onClose: () => void
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ show, onClose }) => {
  if (!show) return null

  const shortcuts = [
    { keys: ['Cmd/Ctrl', 'B'], description: 'Bold text' },
    { keys: ['Cmd/Ctrl', 'I'], description: 'Italic text' },
    { keys: ['Cmd/Ctrl', 'U'], description: 'Underline text' },
    { keys: ['Cmd/Ctrl', 'K'], description: 'Insert link' },
    { keys: ['Cmd/Ctrl', 'E'], description: 'Inline code' },
    { keys: ['Cmd/Ctrl', 'Alt', '1'], description: 'Heading 1' },
    { keys: ['Cmd/Ctrl', 'Alt', '2'], description: 'Heading 2' },
    { keys: ['Cmd/Ctrl', 'Alt', '3'], description: 'Heading 3' },
    { keys: ['Cmd/Ctrl', 'Shift', '8'], description: 'Bullet list' },
    { keys: ['Cmd/Ctrl', 'Shift', '9'], description: 'Numbered list' },
    { keys: ['Cmd/Ctrl', 'Shift', '.'], description: 'Blockquote' },
    { keys: ['Cmd/Ctrl', 'Shift', '`'], description: 'Code block' },
    { keys: ['/', 'Space'], description: 'Insert block menu' },
    { keys: ['Escape'], description: 'Close panels' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Keyboard size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <React.Fragment key={keyIndex}>
                    {keyIndex > 0 && <span className="text-gray-400 text-xs">+</span>}
                    <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">
                      {key}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Type "/" at the beginning of a line to open the block menu, or click the "+" button on empty lines.
          </p>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcuts
