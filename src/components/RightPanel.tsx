import React, { useEffect, useRef, useState, useCallback } from "react"
import { X, FileText, Calendar, Clock, User, Keyboard, GripVertical } from "lucide-react"
import { Task } from "../types"
import SimpleEditor from "./editor/SimpleEditor"
import EditorToolbar from "./editor/EditorToolbar"
import KeyboardShortcuts from "./editor/KeyboardShortcuts"
import { useTheme } from "../contexts/ThemeContext"

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
  const { currentTheme } = useTheme()
  const [notes, setNotes] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null)
  const [editorInstance, setEditorInstance] = useState<any>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [panelWidth, setPanelWidth] = useState(() => {
    // Load saved width from localStorage or use default
    const saved = localStorage.getItem('rightPanelWidth')
    return saved ? parseInt(saved, 10) : 640
  })
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Constants for resize constraints
  const MIN_WIDTH = 320 // Minimum width in pixels
  const MAX_WIDTH = 800 // Maximum width in pixels
  const SAVE_DELAY = 1000 // Delay in milliseconds before saving (1 second)

  // Debounced save function
  const debouncedSave = useCallback((taskId: number, notesContent: string) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Set a new timeout
    saveTimeoutRef.current = setTimeout(() => {
      onSaveNotes(taskId, notesContent)
      setIsTyping(false)
    }, SAVE_DELAY)
  }, [onSaveNotes])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

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
    
    // const handleClickOutside = (e: MouseEvent) => {
    //   const target = e.target as Node
      
    //   // Check if the user clicked on a task item (prevent closing when switching tasks)
    //   if (target instanceof HTMLElement && target.closest('[id^="task"]')) {
    //     return // Don't close if clicking on a task item
    //   }
      
    //   // Check if the click is inside the right panel
    //   if (panelRef.current && !panelRef.current.contains(target)) {
    //     // Check if the click is on the block menu (which is portaled to document.body)
    //     const blockMenu = document.querySelector('.block-menu-portal')
    //     if (blockMenu && blockMenu.contains(target)) {
    //       return // Don't close if clicking on block menu
    //     }
        
    //     // Check if the click is on any other editor-related UI elements
    //     const editorElements = document.querySelectorAll('.ProseMirror, [data-tippy-root], .tippy-box')
    //     for (const element of editorElements) {
    //       if (element.contains(target)) {
    //         return // Don't close if clicking on editor elements
    //       }
    //     }
        
    //     handleClose()
    //   }
    // }
    
    document.addEventListener("keydown", handleKeyDown)
    // document.addEventListener("mousedown", handleClickOutside)
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      // document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [visible, selectedTask, notes])

  useEffect(() => {
    if (selectedTask && selectedTask.id !== currentTaskId) {
      // Save current notes before switching if we have a currentTaskId
      if (currentTaskId !== null) {
        // Clear any pending debounced save and save immediately
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }
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
      setIsTyping(false)
    }
  }, [selectedTask?.id, currentTaskId, notes, onSaveNotes])

  const handleClose = () => {
    if (currentTaskId) {
      // Clear any pending debounced save and save immediately
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      onSaveNotes(currentTaskId, notes)
    }
    setCurrentTaskId(null)
    onClose()
    setIsEditing(false)
    setIsTyping(false)
  }

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes)
    setIsTyping(true)
    
    // Only auto-save if we have a valid currentTaskId and it matches the selected task
    if (currentTaskId && selectedTask && currentTaskId === selectedTask.id) {
      debouncedSave(currentTaskId, newNotes)
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
        flex-shrink-0 h-full ${currentTheme.colors.background.panel} shadow-lg overflow-hidden
        border-l ${currentTheme.colors.border.light} flex flex-col relative
      `}
      style={{ 
        width: `${panelWidth}px`,
        willChange: "width",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Resize Handle */}
      <div
        ref={resizeHandleRef}
        className={`
          absolute left-0 top-0 h-full w-1 cursor-col-resize z-20 group
          ${isResizing ? `w-2 ${currentTheme.colors.primary.dark} transition-none` : `bg-gray-300 hover:bg-blue-500 hover:w-2 transition-all duration-100`}
        `}
        onMouseDown={handleMouseDown}
        title={isResizing ? `Width: ${panelWidth}px` : "Drag to resize panel"}
      >
        {/* Resize indicator */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg">
            <GripVertical size={12} />
          </div>
        </div>
        
        {/* Hover area for easier grabbing */}
        <div className="absolute -left-2 top-0 w-4 h-full" />
      </div>

      {/* Header - Fixed */}
      <div className={`flex-shrink-0 ${currentTheme.colors.background.card} border-b ${currentTheme.colors.border.light} z-10`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${currentTheme.colors.primary.light} rounded-lg flex items-center justify-center`}>
              <FileText size={16} className={currentTheme.colors.primary.text} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${currentTheme.colors.text.primary} truncate max-w-64`}>
                {taskTitle}
              </h2>
              <div className={`flex items-center gap-4 text-xs ${currentTheme.colors.text.muted} mt-1`}>
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
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span>Saving...</span>
              </div>
            )}
            <button
              onClick={() => setShowShortcuts(true)}
              className={`p-2 ${currentTheme.colors.background.hover} rounded-lg transition-colors`}
              title="Keyboard shortcuts"
            >
              <Keyboard size={18} className={currentTheme.colors.text.muted} />
            </button>
            <button
              onClick={handleClose}
              className={`p-2 ${currentTheme.colors.background.hover} rounded-lg transition-colors`}
              aria-label="Close notes"
            >
              <X size={20} className={currentTheme.colors.text.muted} />
            </button>
          </div>
        </div>
      </div>

      {/* Status indicators - Fixed */}
      <div className={`flex-shrink-0 px-6 py-4 border-b ${currentTheme.colors.border.light}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${selectedTask.completed ? currentTheme.colors.status.success.replace('text-', 'bg-') : currentTheme.colors.status.warning.replace('text-', 'bg-')}`} />
              <span className={`text-sm ${currentTheme.colors.text.secondary}`}>
                {selectedTask.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>
            <div className={`w-px h-4 ${currentTheme.colors.border.medium}`} />
            <div className="flex items-center gap-2">
              <User size={12} className={currentTheme.colors.text.muted} />
              <span className={`text-sm ${currentTheme.colors.text.secondary}`}>You</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 transition-all duration-300 ${isTyping ? currentTheme.colors.primary.text : ''}`}>
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isTyping ? `${currentTheme.colors.primary.dark} animate-pulse` : currentTheme.colors.status.success.replace('text-', 'bg-')}`}></div>
              <span className="text-xs font-medium whitespace-nowrap">{isTyping ? 'Typing...' : 'Saved'}</span>
            </div>
            <div className={`hidden sm:flex items-center gap-1.5 text-xs ${currentTheme.colors.text.muted}`}>
              <span>Press</span>
              <kbd className={`${currentTheme.colors.background.hover} ${currentTheme.colors.text.secondary} px-1.5 py-0.5 rounded text-xs font-mono shadow-sm`}>/</kbd>
              <span>for commands</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Toolbar - Fixed */}
      <div className={`flex-shrink-0 ${currentTheme.colors.background.panel} border-b ${currentTheme.colors.border.light}`}>
        <EditorToolbar 
          editor={editorInstance}
          onLinkClick={() => setShowLinkDialog(true)}
        />
      </div>

      {/* Scrollable Notes Content Area */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="px-6 py-4">
          {/* Rich text editor */}
          <div className="bg-transparent -mx-6">
            <SimpleEditor
              key={selectedTask.id} // Force re-mount when task changes
              content={notes}
              onChange={handleNotesChange}
              onFocus={handleEditorFocus}
              onTypingChange={handleTypingChange}
              placeholder="Start writing your notes..."
              autoFocus={visible}
              showToolbar={false}
              onEditorReady={setEditorInstance}
            />
          </div>
        </div>

        {/* Floating action hint */}
        {!isEditing && !isTyping && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className={`${currentTheme.colors.primary.light} border ${currentTheme.colors.border.light} rounded-lg p-3`}>
              <p className={`text-sm ${currentTheme.colors.primary.text}`}>
                💡 <strong>Tip:</strong> Click anywhere in the editor to start writing. Use <kbd className={`${currentTheme.colors.background.hover} px-1 rounded`}>Cmd+B</kbd> for bold, <kbd className={`${currentTheme.colors.background.hover} px-1 rounded`}>Cmd+I</kbd> for italic, and <kbd className={`${currentTheme.colors.background.hover} px-1 rounded`}>/</kbd> for commands!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcuts 
        show={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </div>
  )
}

export default RightPanel