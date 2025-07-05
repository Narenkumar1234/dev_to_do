import { useState } from "react"
import { Plus, CheckCircle2, Circle, Edit3, Trash2, StickyNote, Calendar, Clock } from "lucide-react"
import { Task } from "../types"
import { useTheme } from "../contexts/ThemeContext"
import DeleteConfirmModal from "./DeleteConfirmModal"

interface MiddlePanelProps {
  tasks: Task[]
  addTask: (text: string) => void
  onEditNotes: (taskId: number) => void
  onCompleteTask: (taskId: number) => void
  onDeleteTask: (taskId: number) => void
}

const MiddlePanel = ({
  tasks,
  addTask,
  onEditNotes,
  onCompleteTask,
  onDeleteTask,
}: MiddlePanelProps) => {
  const { currentTheme } = useTheme()
  const [newTask, setNewTask] = useState("")
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    taskId: number | null
    taskText: string
  }>({
    isOpen: false,
    taskId: null,
    taskText: ""
  })

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

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const completedTasks = tasks.filter(task => task.completed)
  const pendingTasks = tasks.filter(task => !task.completed)

  return (
    <div className={`w-3/5 ${currentTheme.colors.background.main} ${currentTheme.colors.border.light} border-r h-full flex flex-col`}>
      {/* Header */}
      <div className={`p-6 pb-4 border-b ${currentTheme.colors.border.light}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${currentTheme.colors.secondary.from} ${currentTheme.colors.secondary.to} rounded-xl flex items-center justify-center shadow-lg`}>
              <StickyNote size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${currentTheme.colors.text.primary}`}>Tasks</h1>
              <div className={`flex items-center gap-4 text-sm ${currentTheme.colors.text.muted}`}>
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
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={`text-sm ${currentTheme.colors.text.muted}`}>Progress</p>
              <p className={`text-lg font-semibold ${currentTheme.colors.text.primary}`}>
                {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
              </p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
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
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Plus size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${currentTheme.colors.text.muted}`} />
            <input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="Add a new task..."
              className={`w-full pl-4 pr-4 py-3 border ${currentTheme.colors.border.light} rounded-xl ${currentTheme.colors.background.card} backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all duration-200`}
            />
          </div>
          <button
            onClick={handleAdd}
            className={`bg-gradient-to-r ${currentTheme.colors.secondary.from} ${currentTheme.colors.secondary.to} text-white px-6 py-3 rounded-xl hover:opacity-90 font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2`}
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {pendingTasks.length > 0 && (
          <div>
            <h3 className={`text-sm font-semibold ${currentTheme.colors.text.secondary} mb-3 flex items-center gap-2`}>
              <Circle size={16} className="text-orange-500" />
              Pending Tasks ({pendingTasks.length})
            </h3>
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <div
                  id={"task"+task.id}
                  key={task.id}
                  className={`group ${currentTheme.colors.background.card} rounded-xl border ${currentTheme.colors.border.light} p-4 ${currentTheme.colors.background.hover} hover:shadow-lg hover:${currentTheme.colors.border.medium} transition-all duration-200 cursor-pointer`}
                  onClick={() => onEditNotes(task.id)}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompleteTask(task.id);
                      }}
                      className={`mt-1 p-1 rounded-full ${currentTheme.colors.background.hover} transition-colors duration-200`}
                      title="Mark as complete"
                    >
                      <Circle size={20} className={`${currentTheme.colors.text.muted} hover:${currentTheme.colors.secondary.text} transition-colors duration-200`} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${currentTheme.colors.text.primary} mb-1 group-hover:${currentTheme.colors.secondary.text} transition-colors duration-200`}>
                        {task.text}
                      </h4>
                      <div className={`flex items-center gap-2 text-sm ${currentTheme.colors.text.muted}`}>
                        <Edit3 size={14} />
                        <span className={`${currentTheme.colors.secondary.text} group-hover:${currentTheme.colors.secondary.text} transition-colors duration-200`}>
                          {task.notes ? 'Click to view/edit notes' : 'Click to add notes'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id, task.text);
                        }}
                        className={`p-2 rounded-lg hover:bg-red-50 ${currentTheme.colors.text.muted} hover:text-red-500 transition-colors duration-200`}
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div>
            <h3 className={`text-sm font-semibold ${currentTheme.colors.text.secondary} mb-3 flex items-center gap-2`}>
              <CheckCircle2 size={16} className={currentTheme.colors.secondary.text} />
              Completed Tasks ({completedTasks.length})
            </h3>
            <div className="space-y-3">
              {completedTasks.map(task => (
                <div
                  id={"task"+task.id}
                  key={task.id}
                  className={`group ${currentTheme.colors.secondary.light} rounded-xl border ${currentTheme.colors.border.light} p-4 ${currentTheme.colors.background.hover} hover:shadow-lg hover:${currentTheme.colors.border.medium} transition-all duration-200 cursor-pointer`}
                  onClick={() => onEditNotes(task.id)}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompleteTask(task.id);
                      }}
                      className={`mt-1 p-1 rounded-full ${currentTheme.colors.background.hover} transition-colors duration-200`}
                      title="Mark as incomplete"
                    >
                      <CheckCircle2 size={20} className={`${currentTheme.colors.secondary.text} hover:${currentTheme.colors.secondary.text} transition-colors duration-200`} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${currentTheme.colors.text.secondary} mb-1 line-through group-hover:${currentTheme.colors.secondary.text} transition-colors duration-200`}>
                        {task.text}
                      </h4>
                      <div className={`flex items-center gap-2 text-sm ${currentTheme.colors.text.muted}`}>
                        <Edit3 size={14} />
                        <span className={`${currentTheme.colors.secondary.text} group-hover:${currentTheme.colors.secondary.text} transition-colors duration-200`}>
                          {task.notes ? 'Click to view/edit notes' : 'Click to add notes'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id, task.text);
                        }}
                        className={`p-2 rounded-lg hover:bg-red-50 ${currentTheme.colors.text.muted} hover:text-red-500 transition-colors duration-200`}
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="text-center py-16">
            <div className={`w-24 h-24 bg-gradient-to-br ${currentTheme.colors.secondary.light} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <StickyNote size={32} className={currentTheme.colors.secondary.text} />
            </div>
            <h3 className={`text-lg font-semibold ${currentTheme.colors.text.primary} mb-2`}>No tasks yet</h3>
            <p className={`${currentTheme.colors.text.muted} text-sm mb-4`}>Create your first task to get started</p>
            <button
              onClick={() => {
                const input = document.querySelector('input[placeholder="Add a new task..."]') as HTMLInputElement;
                if (input) input.focus();
              }}
              className={`bg-gradient-to-r ${currentTheme.colors.secondary.from} ${currentTheme.colors.secondary.to} text-white px-6 py-2 rounded-lg hover:opacity-90 font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto`}
            >
              <Plus size={16} />
              Add Your First Task
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