import React, { useEffect, useRef, useState, useCallback } from "react"
import { X, FileText, Calendar, Clock, User, Keyboard, GripVertical } from "lucide-react"
import { Task } from "../types"
import SimpleEditor from "./editor/SimpleEditor"
import KeyboardShortcuts from "./editor/KeyboardShortcuts"

interface RightPanelProps {
  selectedTask: Task | null
  onClose: () => void
  onSaveNotes: (taskId: number, notes: string) => void
  visible: boolean
  onWidthChange?: (width: number) => void
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  selectedTask, 
  onClose, 
  onSaveNotes, 
  visible,
  onWidthChange 
}) => {
  const [notes, setNotes] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null)
  const [panelWidth, setPanelWidth] = useState(() => {
    // Load saved width from localStorage or use default
    const saved = localStorage.getItem('rightPanelWidth')
    return saved ? parseInt(saved, 10) : 640
  })
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)

  // Constants for resize constraints
  const MIN_WIDTH = 320 // Minimum width in pixels
  const MAX_WIDTH = 800 // Maximum width in pixels

  // Handle resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return
    
    // Use requestAnimationFrame for smooth resizing
    requestAnimationFrame(() => {
      const newWidth = window.innerWidth - e.clientX
      const constrainedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH)
      setPanelWidth(constrainedWidth)
    })
  }, [isResizing])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  // Save width to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('rightPanelWidth', panelWidth.toString())
  }, [panelWidth])

  // Notify parent about width changes
  useEffect(() => {
    if (onWidthChange && visible) {
      onWidthChange(panelWidth)
    }
  }, [panelWidth, visible, onWidthChange])

  // Set up resize event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  useEffect(() => {
    if (!visible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      
      // Check if the user clicked on a task item (prevent closing when switching tasks)
      if (target instanceof HTMLElement && target.closest('[id^="task"]')) {
        return // Don't close if clicking on a task item
      }
      
      // Check if the click is inside the right panel
      if (panelRef.current && !panelRef.current.contains(target)) {
        // Check if the click is on the block menu (which is portaled to document.body)
        const blockMenu = document.querySelector('.block-menu-portal')
        if (blockMenu && blockMenu.contains(target)) {
          return // Don't close if clicking on block menu
        }
        
        // Check if the click is on any other editor-related UI elements
        const editorElements = document.querySelectorAll('.ProseMirror, [data-tippy-root], .tippy-box')
        for (const element of editorElements) {
          if (element.contains(target)) {
            return // Don't close if clicking on editor elements
          }
        }
        
        handleClose()
      }
    }
    
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [visible, selectedTask, notes])

  useEffect(() => {
    if (selectedTask && selectedTask.id !== currentTaskId) {
      // Save current notes before switching if we have a currentTaskId
      if (currentTaskId !== null) {
        onSaveNotes(currentTaskId, notes)
      }
      
      // Set new task
      setCurrentTaskId(selectedTask.id)
      setTaskTitle(selectedTask.text)
      
      // Initialize with existing notes or create new note with task title
      if (!selectedTask.notes || selectedTask.notes.trim() === "") {
        // Create new note starting with task name as H1 title
        const initialContent = `<h1>${selectedTask.text}</h1><p></p>`
        setNotes(initialContent)
      } else {
        setNotes(selectedTask.notes)
      }
      
      // Reset editing state when switching tasks
      setIsEditing(false)
    }
  }, [selectedTask?.id, currentTaskId, notes, onSaveNotes])

  const handleClose = () => {
    if (currentTaskId) {
      onSaveNotes(currentTaskId, notes)
    }
    setCurrentTaskId(null)
    onClose()
    setIsEditing(false)
  }

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes)
    // Only auto-save if we have a valid currentTaskId and it matches the selected task
    if (currentTaskId && selectedTask && currentTaskId === selectedTask.id) {
      onSaveNotes(currentTaskId, newNotes)
    }
  }

  const handleEditorFocus = () => {
    setIsEditing(true)
  }

  const handleTypingChange = (typing: boolean) => {
    setIsTyping(typing)
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!visible || !selectedTask) {
    return null
  }

  return (
    <div
      ref={panelRef}
      className={`
        fixed top-0 right-0 h-full bg-white shadow-2xl overflow-hidden z-50
        transform transition-transform duration-75 ease-out
        ${visible ? "translate-x-0" : "translate-x-full"}
        border-l border-gray-200
      `}
      style={{ 
        width: `${panelWidth}px`,
        willChange: "transform, width",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Resize Handle */}
      <div
        ref={resizeHandleRef}
        className={`
          absolute left-0 top-0 h-full w-1 cursor-col-resize z-10
          ${isResizing ? 'w-2 bg-blue-500 transition-none' : 'bg-transparent hover:bg-blue-300 transition-all duration-100'}
        `}
        onMouseDown={handleMouseDown}
        title={isResizing ? `Width: ${panelWidth}px` : "Drag to resize panel"}
      >
        {/* Resize indicator */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-blue-500 text-white p-1 rounded-full shadow-lg">
            <GripVertical size={12} />
          </div>
        </div>
        
        {/* Hover area for easier grabbing */}
        <div className="absolute -left-2 top-0 w-4 h-full" />
      </div>

      {/* Resize overlay during resizing */}
      {isResizing && (
        <div className="fixed inset-0 bg-black bg-opacity-10 z-40">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg shadow-lg">
            Width: {panelWidth}px
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 truncate max-w-64">
                {taskTitle}
              </h2>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  {getCurrentDate()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {getCurrentTime()}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Keyboard shortcuts"
            >
              <Keyboard size={18} className="text-gray-500" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close notes"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-full overflow-y-auto pb-20">
        <div className="px-6 py-4">
          {/* Status indicators */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedTask.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-sm text-gray-600">
                  {selectedTask.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-2">
                <User size={12} className="text-gray-400" />
                <span className="text-sm text-gray-600">You</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1.5 transition-all duration-300 ${isTyping ? 'text-blue-600' : ''}`}>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isTyping ? 'bg-blue-500 animate-pulse' : 'bg-emerald-400'}`}></div>
                <span className="text-xs font-medium whitespace-nowrap">{isTyping ? 'Typing...' : 'Saved'}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
                <span>Press</span>
                <kbd className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono shadow-sm">/</kbd>
                <span>for commands</span>
              </div>
            </div>
          </div>

          {/* Rich text editor */}
          <div className="bg-transparent -mx-6">
            <SimpleEditor
              key={selectedTask.id} // Force re-mount when task changes
              content={notes}
              onChange={handleNotesChange}
              onFocus={handleEditorFocus}
              onTypingChange={handleTypingChange}
              placeholder="Start writing your notes..."
            />
          </div>
        </div>
      </div>

      {/* Floating action hint */}
      {!isEditing && !isTyping && (
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Click anywhere in the editor to start writing. Use <kbd className="bg-blue-100 px-1 rounded">Cmd+B</kbd> for bold, <kbd className="bg-blue-100 px-1 rounded">Cmd+I</kbd> for italic, and <kbd className="bg-blue-100 px-1 rounded">/</kbd> for commands!
            </p>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcuts 
        show={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </div>
  )
}

export default RightPanel