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
  isMobile?: boolean
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  selectedTask, 
  onClose, 
  onSaveNotes, 
  visible,
  onWidthChange,
  isMobile = false
}) => {
  const { currentTheme } = useTheme()
  const [notes, setNotes] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null)
  const [originalNotes, setOriginalNotes] = useState("") // Track original notes to detect changes
  const [editorInstance, setEditorInstance] = useState<any>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [panelWidth, setPanelWidth] = useState(() => {
    // Load saved width from localStorage or use default
    const saved = localStorage.getItem('rightPanelWidth')
    const savedWidth = saved ? parseInt(saved, 10) : 640
    return Math.max(savedWidth, 450)
  })
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)

  // Constants for resize constraints
  const MIN_WIDTH = 450 // Minimum width in pixels
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
      // Save current notes before switching if we have a currentTaskId AND there are actual changes
      if (currentTaskId !== null) {
        // Only save if the current notes are different from the original notes
        if (notes !== originalNotes) {
          onSaveNotes(currentTaskId, notes)
        }
      }
      
      // Set new task
      setCurrentTaskId(selectedTask.id)
      setTaskTitle(selectedTask.text)
      
      // Initialize with existing notes or create new note with task title
      if (!selectedTask.notes || selectedTask.notes.trim() === "") {
        // Create new note starting with task name as H1 title
        const initialContent = `<h1>${selectedTask.text}</h1><p></p>`
        setNotes(initialContent)
        setOriginalNotes(initialContent)
      } else {
        setNotes(selectedTask.notes)
        setOriginalNotes(selectedTask.notes)
      }
      
      // Reset editing state when switching tasks
      setIsEditing(false)
      setIsTyping(false)
    }
  }, [selectedTask?.id, currentTaskId, notes, onSaveNotes])

  const handleClose = () => {
    if (currentTaskId) {
      // Only save if the current notes are different from the original notes
      if (notes !== originalNotes) {
        onSaveNotes(currentTaskId, notes)
      }
    }
    setCurrentTaskId(null)
    setOriginalNotes("")
    onClose()
    setIsEditing(false)
    setIsTyping(false)
  }

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes)
    setIsTyping(true)
    
    // Save immediately to localStorage via parent component
    if (currentTaskId && selectedTask && currentTaskId === selectedTask.id) {
      onSaveNotes(currentTaskId, newNotes)
      // Update originalNotes to reflect the save
      setOriginalNotes(newNotes)
      // Reset typing state since we saved
      setTimeout(() => setIsTyping(false), 500)
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

  // Mobile layout - full screen
  if (isMobile) {
    return (
      <div className={`h-full ${currentTheme.colors.background.panel} flex flex-col`}>
        {/* Mobile Header */}
        <div className={`flex-shrink-0 ${currentTheme.colors.background.card} border-b ${currentTheme.colors.border.light} z-10`}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${currentTheme.colors.background.hover} ${currentTheme.colors.text.muted} hover:${currentTheme.colors.primary.text} transition-colors duration-200`}
                title="Close notes"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-2">
                <FileText size={20} className={currentTheme.colors.primary.text} />
                <span className={`font-semibold ${currentTheme.colors.text.primary} text-lg`}>Task Notes</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isTyping && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
                  <span>Saving...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Task Info */}
        <div className={`flex-shrink-0 px-4 py-3 ${currentTheme.colors.background.card} border-b ${currentTheme.colors.border.light}`}>
          <h3 className={`font-medium ${currentTheme.colors.text.primary} mb-2 text-sm`}>
            {taskTitle || "Untitled Task"}
          </h3>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{getCurrentTime()}</span>
            </div>
          </div>
        </div>

        {/* Mobile Editor */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 p-4">
            <SimpleEditor
              content={notes}
              onChange={handleNotesChange}
              onEditorReady={setEditorInstance}
              placeholder="Add your notes here..."
              autoFocus={false}
            />
          </div>
        </div>
      </div>
    )
  }

  // Desktop layout
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