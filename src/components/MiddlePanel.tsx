import { useState } from "react"
import { Plus, CheckCircle2, Circle, Edit3, Trash2, StickyNote, Calendar, Clock, Menu, FolderOpen, Search } from "lucide-react"
import { Task, Tab } from "../types"
import { useTheme } from "../contexts/ThemeContext"
import DeleteConfirmModal from "./DeleteConfirmModal"

interface MiddlePanelProps {
  tasks: Task[]
  addTask: (text: string) => void
  onEditNotes: (taskId: number) => void
  onCompleteTask: (taskId: number) => void
  onDeleteTask: (taskId: number) => void
  workspaceName: string
  selectedTaskId: number | null
  workspaceCreatedAt?: string
  // Mobile-specific props
  isMobile?: boolean
  tabs?: Tab[]
  activeTabId?: string
  onTabClick?: (tabId: string) => void
  onRenameTab?: (tabId: string, newName: string) => void
  onNewTab?: (name: string) => void
  onDeleteTab?: (tabId: string) => void
}

const MiddlePanel = ({
  tasks,
  addTask,
  onEditNotes,
  onCompleteTask,
  onDeleteTask,
  workspaceName,
  selectedTaskId,
  workspaceCreatedAt,
  isMobile = false,
  tabs = [],
  activeTabId = "",
  onTabClick = () => {},
  onRenameTab = () => {},
  onNewTab = () => {},
  onDeleteTab = () => {},
}: MiddlePanelProps) => {
  const { currentTheme } = useTheme()
  const [newTask, setNewTask] = useState("")
  const [showWorkspaces, setShowWorkspaces] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    taskId: number | null
    taskText: string
  }>({
    isOpen: false,
    taskId: null,
    taskText: ""
  })

  // Filter tabs for mobile workspace selector
  const filteredTabs = tabs.filter((tab) =>
    tab.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    if (newTask.trim() !== "") {
      addTask(newTask.trim())
      setNewTask("")
    }
  }

  const handleDeleteTask = (taskId: number, taskText: string) => {
    setDeleteModal({
      isOpen: true,
      taskId,
      taskText
    })
  }

  const confirmDeleteTask = () => {
    if (deleteModal.taskId !== null) {
      onDeleteTask(deleteModal.taskId)
    }
  }

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      taskId: null,
      taskText: ""
    })
  }

  const getWorkspaceDate = () => {
    if (workspaceCreatedAt) {
      return new Date(workspaceCreatedAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    }
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getWorkspaceTime = () => {
    if (workspaceCreatedAt) {
      return new Date(workspaceCreatedAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTaskLastModified = (task: Task) => {
    if (task.lastModified) {
      return new Date(task.lastModified).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    return null
  }

  const completedTasks = tasks.filter(task => task.completed)
  const pendingTasks = tasks.filter(task => !task.completed)

  return (
    <div className={`flex-1 ${currentTheme.colors.background.main} ${currentTheme.colors.border.light} ${!isMobile ? 'border-r' : ''} h-full flex flex-col min-w-0 min-h-0 w-full`}>
      
      {/* Mobile Workspace Selector */}
      {isMobile && (
        <>
          <div className={`p-3 border-b ${currentTheme.colors.border.light} bg-white`}>
            <button
              onClick={() => setShowWorkspaces(!showWorkspaces)}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border ${currentTheme.colors.border.light} ${currentTheme.colors.background.card} hover:${currentTheme.colors.background.hover} transition-colors min-h-[44px]`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen size={16} className={currentTheme.colors.primary.text} />
                <span className={`font-medium ${currentTheme.colors.text.primary} text-sm`}>{workspaceName}</span>
              </div>
              <Menu size={16} className={currentTheme.colors.text.muted} />
            </button>
          </div>

          {/* Mobile Workspace List Overlay */}
          {showWorkspaces && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
              <div className={`w-full bg-white rounded-t-xl max-h-80 overflow-hidden`}>
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold">Workspaces</h3>
                    <button
                      onClick={() => setShowWorkspaces(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search workspaces..."
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-base"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto p-3 space-y-2">
                  {filteredTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabClick(tab.id)
                        setShowWorkspaces(false)
                        setSearchTerm("")
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors min-h-[44px] ${
                        tab.id === activeTabId 
                          ? `${currentTheme.colors.primary.light} ${currentTheme.colors.primary.dark}` 
                          : `hover:${currentTheme.colors.background.hover}`
                      }`}
                    >
                      <div className="font-medium text-sm">{tab.name}</div>
                      <div className="text-xs text-gray-500">
                        {tab.id === activeTabId ? "Current workspace" : "Tap to switch"}
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const name = prompt("Workspace name:")
                      if (name?.trim()) {
                        onNewTab(name.trim())
                        setShowWorkspaces(false)
                      }
                    }}
                    className={`w-full text-left p-3 rounded-lg border-2 border-dashed ${currentTheme.colors.border.light} ${currentTheme.colors.text.muted} hover:${currentTheme.colors.primary.light} transition-colors min-h-[44px]`}
                  >
                    <div className="flex items-center gap-2">
                      <Plus size={14} />
                      <span className="text-sm">Create New Workspace</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Header */}
      <div className={`p-3 md:p-6 pb-3 md:pb-4 border-b ${currentTheme.colors.border.light}`}>
        <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br ${currentTheme.colors.secondary.from} ${currentTheme.colors.secondary.to} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
              <StickyNote size={14} className="text-white md:hidden" />
              <StickyNote size={20} className="text-white hidden md:block" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className={`text-base md:text-xl font-bold ${currentTheme.colors.text.primary} truncate`}>{workspaceName}</h1>
              <div className={`flex items-center gap-2 md:gap-4 text-xs md:text-sm ${currentTheme.colors.text.muted}`}>
                <div className="flex items-center gap-1">
                  <Calendar size={10} className="md:hidden" />
                  <Calendar size={12} className="hidden md:block" />
                  <span className="truncate">{getWorkspaceDate()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={10} className="md:hidden" />
                  <Clock size={12} className="hidden md:block" />
                  <span>{getWorkspaceTime()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <div className="text-right">
              <p className={`text-xs md:text-sm ${currentTheme.colors.text.muted}`}>Progress</p>
              <p className={`text-sm md:text-lg font-semibold ${currentTheme.colors.text.primary}`}>
                {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
              </p>
            </div>
            <div className="w-10 h-10 md:w-16 md:h-16 relative flex-shrink-0">
              <svg className="w-10 h-10 md:w-16 md:h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeDasharray={`${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}, 100`}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Add Task Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Plus size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${currentTheme.colors.text.muted}`} />
            <input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="Add a new task..."
              className={`w-full pl-9 pr-3 py-3 border ${currentTheme.colors.border.light} rounded-lg ${currentTheme.colors.background.card} backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-base transition-all duration-200`}
            />
          </div>
          <button
            onClick={handleAdd}
            className={`bg-gradient-to-r ${currentTheme.colors.secondary.from} ${currentTheme.colors.secondary.to} text-white px-4 py-3 rounded-lg hover:opacity-90 font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-base min-h-[44px]`}
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 md:p-6 pb-20 space-y-3 md:space-y-4"> {/* Added min-h-0 for proper flex behavior */}
        {pendingTasks.length > 0 && (
          <div>
            <h3 className={`text-sm font-semibold ${currentTheme.colors.text.secondary} mb-2 md:mb-3 flex items-center gap-2`}>
              <Circle size={14} className="text-orange-500 flex-shrink-0" />
              <span className="truncate">Pending Tasks ({pendingTasks.length})</span>
            </h3>
            <div className="space-y-2 md:space-y-3">
              {pendingTasks.map(task => {
                const isSelected = selectedTaskId === task.id;
                return (
                <div
                  id={"task"+task.id}
                  key={task.id}
                  className={`group ${currentTheme.colors.background.card} rounded-lg md:rounded-xl border ${
                    isSelected 
                      ? `${currentTheme.colors.primary.dark} shadow-lg scale-[1.02]` 
                      : `${currentTheme.colors.border.light} hover:${currentTheme.colors.border.medium}`
                  } p-3 md:p-4 ${
                    isSelected 
                      ? `${currentTheme.colors.primary.light} shadow-lg` 
                      : `${currentTheme.colors.background.hover} hover:shadow-lg`
                  } transition-all duration-200 cursor-pointer ${
                    isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}
                  onClick={() => onEditNotes(task.id)}
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompleteTask(task.id);
                      }}
                      className={`mt-1 p-1.5 md:p-1 rounded-full ${currentTheme.colors.background.hover} transition-colors duration-200 flex-shrink-0 min-w-[36px] md:min-w-auto min-h-[36px] md:min-h-auto flex items-center justify-center`}
                      title="Mark as complete"
                    >
                      <Circle size={16} className={`md:w-5 md:h-5 ${currentTheme.colors.text.muted} hover:${currentTheme.colors.secondary.text} transition-colors duration-200`} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${
                        isSelected ? currentTheme.colors.primary.text : currentTheme.colors.text.primary
                      } mb-1 group-hover:${currentTheme.colors.secondary.text} transition-colors duration-200 text-sm md:text-base break-words leading-relaxed`}>
                        {task.text}
                      </h4>
                      <div className={`flex items-center gap-2 text-xs md:text-sm ${currentTheme.colors.text.muted}`}>
                        <Edit3 size={12} className="md:w-3.5 md:h-3.5 flex-shrink-0" />
                        <span className={`${currentTheme.colors.secondary.text} group-hover:${currentTheme.colors.secondary.text} transition-colors duration-200 truncate`}>
                          {task.notes ? 'Click to view/edit notes' : 'Click to add notes'}
                        </span>
                        {isSelected && getTaskLastModified(task) && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                              Last edited: {getTaskLastModified(task)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-1 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200 flex-shrink-0`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id, task.text);
                        }}
                        className={`p-2 md:p-1.5 rounded-lg hover:bg-red-50 ${currentTheme.colors.text.muted} hover:text-red-500 transition-colors duration-200 min-w-[40px] md:min-w-auto min-h-[40px] md:min-h-auto flex items-center justify-center`}
                        title="Delete task"
                      >
                        <Trash2 size={14} className="md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div>
            <h3 className={`text-sm font-semibold ${currentTheme.colors.text.secondary} mb-2 md:mb-3 flex items-center gap-2`}>
              <CheckCircle2 size={14} className={`${currentTheme.colors.secondary.text} flex-shrink-0`} />
              <span className="truncate">Completed Tasks ({completedTasks.length})</span>
            </h3>
            <div className="space-y-2 md:space-y-3">
              {completedTasks.map(task => {
                const isSelected = selectedTaskId === task.id;
                return (
                <div
                  id={"task"+task.id}
                  key={task.id}
                  className={`group ${currentTheme.colors.secondary.light} rounded-lg md:rounded-xl border p-3 md:p-4 ${
                    isSelected 
                      ? `${currentTheme.colors.primary.light} shadow-lg` 
                      : `hover:bg-gray-50 hover:shadow-lg`
                  } transition-all duration-200 cursor-pointer ${
                    isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}
                  onClick={() => onEditNotes(task.id)}
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompleteTask(task.id);
                      }}
                      className={`mt-1 p-1.5 md:p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 flex-shrink-0 min-w-[36px] md:min-w-auto min-h-[36px] md:min-h-auto flex items-center justify-center`}
                      title="Mark as incomplete"
                    >
                      <CheckCircle2 size={16} className={`md:w-5 md:h-5 ${currentTheme.colors.secondary.text} hover:${currentTheme.colors.secondary.text} transition-colors duration-200`} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${
                        isSelected ? currentTheme.colors.primary.text : currentTheme.colors.text.secondary
                      } mb-1 line-through group-hover:${currentTheme.colors.secondary.text} transition-colors duration-200 text-sm md:text-base break-words leading-relaxed`}>
                        {task.text}
                      </h4>
                      <div className={`flex items-center gap-2 text-xs md:text-sm ${currentTheme.colors.text.muted}`}>
                        <Edit3 size={12} className="md:w-3.5 md:h-3.5 flex-shrink-0" />
                        <span className={`${currentTheme.colors.secondary.text} group-hover:${currentTheme.colors.secondary.text} transition-colors duration-200 truncate`}>
                          {task.notes ? 'Click to view/edit notes' : 'Click to add notes'}
                        </span>
                        {isSelected && getTaskLastModified(task) && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                              Last edited: {getTaskLastModified(task)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-1 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200 flex-shrink-0`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id, task.text);
                        }}
                        className={`p-2 md:p-1.5 rounded-lg hover:bg-red-50 ${currentTheme.colors.text.muted} hover:text-red-500 transition-colors duration-200 min-w-[40px] md:min-w-auto min-h-[40px] md:min-h-auto flex items-center justify-center`}
                        title="Delete task"
                      >
                        <Trash2 size={14} className="md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="text-center py-8 md:py-16">
            <div className={`w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br ${currentTheme.colors.secondary.light} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <StickyNote size={24} className={`${currentTheme.colors.secondary.text} md:w-8 md:h-8`} />
            </div>
            <h3 className={`text-base md:text-lg font-semibold ${currentTheme.colors.text.primary} mb-2`}>No tasks yet</h3>
            <p className={`${currentTheme.colors.text.muted} text-sm mb-4 px-4`}>Create your first task to get started</p>
            <button
              onClick={() => {
                const input = document.querySelector('input[placeholder="Add a new task..."]') as HTMLInputElement;
                if (input) input.focus();
              }}
              className={`bg-gradient-to-r ${currentTheme.colors.secondary.from} ${currentTheme.colors.secondary.to} text-white px-4 md:px-6 py-2 rounded-lg hover:opacity-90 font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto text-sm md:text-base`}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Your First Task</span>
              <span className="sm:hidden">Add Task</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        itemName={deleteModal.taskText}
        itemType="task"
      />
    </div>
  )
}

export default MiddlePanel