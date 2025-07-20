import { useEffect, useState } from "react"
import dayjs from "dayjs"
import LeftPanel from "./components/LeftPanel"
import MiddlePanel from "./components/MiddlePanel"
import RightPanel from "./components/RightPanel"
import VizgoLogo from "./components/VizgoLogo"
import { Task, TaskMap, Tab, TabsMap } from "./types"
import { ThemeProvider, useTheme } from "./contexts/ThemeContext"
import { NotificationProvider, useNotification } from "./contexts/NotificationContext"
import "./styles.css"
import {
  upsertTasksForTab,
  deleteTabFromStorage,
  initializeApp,
  createNewTab,
  renameTab,
  saveLastSelectedTab
} from "./utils";

const AppContent = () => {
  const { currentTheme } = useTheme()
  const { showSuccessNotification, showErrorNotification } = useNotification()
  const today = dayjs().format("DD-MMM-YY")

  const [dataLoaded, setDataLoaded] = useState(false);
  const [tasksByDate, setTasksByDate] = useState<TaskMap>({})
  const [tabs, setTabs] = useState<TabsMap>({})
  const [selectedTabId, setSelectedTabId] = useState<string>("")
  const [showNotesPanel, setShowNotesPanel] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  
  const tasks = tasksByDate[selectedTabId] || []


  // Load initial data
  useEffect(() => {
    const loadData = () => {
      const { tasks, tabs: tabsData, defaultTabId } = initializeApp(today);
      setTasksByDate(tasks);
      setTabs(tabsData);
      setSelectedTabId(defaultTabId);
      setDataLoaded(true);
    };

    if (!dataLoaded) {
      loadData();
    }
  }, [today, dataLoaded]);

  // Save the last selected tab when it changes
  useEffect(() => {
    if (selectedTabId) {
      saveLastSelectedTab(selectedTabId);
    }
  }, [selectedTabId]);  const onDeleteTab = (tabId: string) => {
    deleteTabFromStorage(tabId);
    setTasksByDate(prev => {
      const { [tabId]: _, ...rest } = prev;
      return rest;
    });
    setTabs(prev => {
      const { [tabId]: _, ...rest } = prev;
      return rest;
    });
    if (selectedTabId === tabId) {
      const remainingTabIds = Object.keys(tasksByDate).filter(id => id !== tabId);
      if (remainingTabIds.length > 0) {
        setSelectedTabId(remainingTabIds[0]);
      } else {
        // If no tabs remain, create a new default tab
        const { tasks, tabs: tabsData, defaultTabId } = initializeApp(today);
        setTasksByDate(tasks);
        setTabs(tabsData);
        setSelectedTabId(defaultTabId);
      }
    }
  };

  const addTask = (text: string) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: Date.now(),
      text,
      notes: "",
      completed: false,
      createdAt: now,
      lastModified: now,
    }
    // Add new task at the beginning of the array
    const updatedTasks = [newTask, ...tasks]
    setTasksByDate(prev => ({ ...prev, [selectedTabId]: updatedTasks }))
    // Save to localStorage immediately
    upsertTasksForTab(selectedTabId, updatedTasks)
  }

  const completeTask = (taskId: number) => {
    const now = new Date().toISOString();
    const updated = tasksByDate[selectedTabId].map(task =>
      task.id === taskId ? { ...task, completed: !task.completed, lastModified: now } : task
    )
    // Keep all tasks, just toggle completed state
    setTasksByDate(prev => ({ ...prev, [selectedTabId]: updated }))
    // Save to localStorage immediately
    upsertTasksForTab(selectedTabId, updated)
  }

  const deleteTask = (taskId: number) => {
    const updated = tasksByDate[selectedTabId].filter(task => task.id !== taskId)
    setTasksByDate(prev => ({ ...prev, [selectedTabId]: updated }))
    // Save to localStorage immediately
    upsertTasksForTab(selectedTabId, updated)
  }

  const openNotesPanel = (taskId: number) => {
    setSelectedTaskId(taskId)
    setShowNotesPanel(true)
  }

  const closeNotesPanel = () => {
    setSelectedTaskId(null)
    setShowNotesPanel(false)
  }

  const saveNotes = (taskId: number, notes: string) => {
    const now = new Date().toISOString();
    const updated = tasksByDate[selectedTabId].map(task => {
      if (task.id === taskId) {
        return { ...task, notes, lastModified: now }
      }
      return task
    })
    setTasksByDate(prev => ({ ...prev, [selectedTabId]: updated }))
    
    // Save to localStorage immediately
    upsertTasksForTab(selectedTabId, updated)
  }

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) || null : null

  return (
    <div className={`flex h-screen overflow-hidden ${currentTheme.colors.background.main} min-w-0 w-full`}>
      {/* Mobile Header - Only visible on small screens */}
      <div className="md:hidden w-full fixed top-0 left-0 right-0 z-40">
        <div 
          className="flex items-center justify-between p-3 sm:p-4 border-b"
          style={{ 
            backgroundColor: currentTheme.colors.background.panel,
            borderColor: currentTheme.colors.border.light
          }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <VizgoLogo size={24} className={`${currentTheme.colors.primary.text} flex-shrink-0`} />
            <span className={`text-sm sm:text-base font-bold ${currentTheme.colors.text.primary} truncate`}>
              {tabs[selectedTabId]?.name || "Tasks"}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${currentTheme.colors.background.card} border ${currentTheme.colors.border.light}`}>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className={`text-xs font-medium ${currentTheme.colors.text.muted}`}>Saved Locally</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Three panel layout for medium+ screens */}
      <div className="hidden md:flex w-full">
        <LeftPanel
          tabs={Object.values(tabs)} // Convert TabsMap to Tab[]
          activeTabId={selectedTabId}
          onTabClick={setSelectedTabId}
          onRenameTab={(tabId: string, newName: string) => {
            const updatedTabs = renameTab(tabId, newName);
            setTabs(updatedTabs);
          }}
          onNewTab={(name: string) => {
            const { tabId, tabs: updatedTabs, tasks: updatedTasks } = createNewTab(name);
            setTabs(updatedTabs);
            setTasksByDate(updatedTasks);
            setSelectedTabId(tabId); // Auto-select new tab
          }}
          onDeleteTab={onDeleteTab}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop Header */}
          <div 
            className="flex items-center justify-between p-4 border-b"
            style={{ 
              backgroundColor: currentTheme.colors.background.panel,
              borderColor: currentTheme.colors.border.light
            }}
          >
            <div className="flex items-center gap-3">
              <VizgoLogo size={40} className={currentTheme.colors.primary.text} />
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentTheme.colors.background.card} border ${currentTheme.colors.border.light}`}>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className={`text-sm font-medium ${currentTheme.colors.text.muted}`}>Saved Locally</span>
              </div>
            </div>
          </div>


          <MiddlePanel
            tasks={tasks}
            addTask={addTask}
            onEditNotes={openNotesPanel}
            onCompleteTask={completeTask}
            onDeleteTask={deleteTask}
            workspaceName={tabs[selectedTabId]?.name || "Tasks"}
            selectedTaskId={selectedTaskId}
            workspaceCreatedAt={tabs[selectedTabId]?.createdAt}
          />
        </div>

        {showNotesPanel && (
          <RightPanel
            selectedTask={selectedTask}
            onClose={closeNotesPanel}
            onSaveNotes={saveNotes}
            visible={showNotesPanel}
            onWidthChange={() => {}} // No longer needed for layout
          />
        )}
      </div>

      {/* Mobile Layout - Single panel view */}
      <div className="md:hidden flex-1 flex flex-col w-full h-full pt-16">
        <MiddlePanel
          tasks={tasks}
          addTask={addTask}
          onEditNotes={openNotesPanel}
          onCompleteTask={completeTask}
          onDeleteTask={deleteTask}
          workspaceName={tabs[selectedTabId]?.name || "Tasks"}
          selectedTaskId={selectedTaskId}
          workspaceCreatedAt={tabs[selectedTabId]?.createdAt}
          isMobile={true}
          tabs={Object.values(tabs)}
          activeTabId={selectedTabId}
          onTabClick={setSelectedTabId}
          onRenameTab={(tabId: string, newName: string) => {
            const updatedTabs = renameTab(tabId, newName);
            setTabs(updatedTabs);
          }}
          onNewTab={(name: string) => {
            const { tabId, tabs: updatedTabs, tasks: updatedTasks } = createNewTab(name);
            setTabs(updatedTabs);
            setTasksByDate(updatedTasks);
            setSelectedTabId(tabId);
          }}
          onDeleteTab={onDeleteTab}
        />

        {/* Mobile Notes Panel - Full screen overlay */}
        {showNotesPanel && (
          <div className="fixed inset-0 z-50 bg-white">
            <RightPanel
              selectedTask={selectedTask}
              onClose={closeNotesPanel}
              onSaveNotes={saveNotes}
              visible={showNotesPanel}
              onWidthChange={() => {}}
              isMobile={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App