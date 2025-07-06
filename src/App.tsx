import { useEffect, useState, useRef, useCallback } from "react"
import dayjs from "dayjs"
import LeftPanel from "./components/LeftPanel"
import MiddlePanel from "./components/MiddlePanel"
import RightPanel from "./components/RightPanel"
import UserProfile from "./components/UserProfile"
import SignInButton from "./components/SignInButton"
import ProtectedRoute from "./components/ProtectedRoute"
import { Task, TaskMap, Tab, TabsMap } from "./types"
import { ThemeProvider, useTheme } from "./contexts/ThemeContext"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { NotificationProvider, useNotification } from "./contexts/NotificationContext"
import { FirebaseDataService } from "./lib/firebaseDataService"
import "./styles.css"
import {
  upsertTasksForTab,
  deleteTabFromStorage,
  initializeApp,
  createNewTab,
  renameTab,
  saveLastSelectedTab,
  getTasksFromStorage,
  getTabsFromStorage,
  syncDataWithFirebase
} from "./utils-firebase";

const AppContent = () => {
  const { currentTheme } = useTheme()
  const { user } = useAuth()
  const { showSyncNotification, showSuccessNotification, showErrorNotification } = useNotification()
  const today = dayjs().format("DD-MMM-YY")

  const [dataLoaded, setDataLoaded] = useState(false);
  const [tasksByDate, setTasksByDate] = useState<TaskMap>({})
  const [tabs, setTabs] = useState<TabsMap>({})
  const [selectedTabId, setSelectedTabId] = useState<string>("")
  const [showNotesPanel, setShowNotesPanel] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [rightPanelWidth, setRightPanelWidth] = useState(() => {
    // Load saved width from localStorage or use default
    const saved = localStorage.getItem('rightPanelWidth')
    return saved ? parseInt(saved, 10) : 640
  })
  const [dataService, setDataService] = useState<FirebaseDataService | null>(null)
  const firebaseSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const tasks = tasksByDate[selectedTabId] || []
  const FIREBASE_SAVE_DELAY = 1500 // 1.5 seconds delay for Firebase saves

  // Debounced Firebase save function
  const debouncedFirebaseSave = useCallback((tabId: string, tasksData: Task[]) => {
    // Clear any existing timeout
    if (firebaseSaveTimeoutRef.current) {
      clearTimeout(firebaseSaveTimeoutRef.current)
    }
    
    // Set a new timeout
    firebaseSaveTimeoutRef.current = setTimeout(() => {
      upsertTasksForTab(tabId, tasksData, dataService || undefined)
    }, FIREBASE_SAVE_DELAY)
  }, [dataService])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (firebaseSaveTimeoutRef.current) {
        clearTimeout(firebaseSaveTimeoutRef.current)
      }
    }
  }, [])

  // Handle immediate Firebase save when needed (e.g., on tab switch, app close)
  const immediateFirebaseSave = useCallback((tabId: string, tasksData: Task[]) => {
    if (firebaseSaveTimeoutRef.current) {
      clearTimeout(firebaseSaveTimeoutRef.current)
    }
    upsertTasksForTab(tabId, tasksData, dataService || undefined)
  }, [dataService])

  // Save immediately when switching tabs
  useEffect(() => {
    return () => {
      if (selectedTabId && tasksByDate[selectedTabId]) {
        immediateFirebaseSave(selectedTabId, tasksByDate[selectedTabId])
      }
    }
  }, [selectedTabId, tasksByDate, immediateFirebaseSave])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedTabId && tasksByDate[selectedTabId]) {
        immediateFirebaseSave(selectedTabId, tasksByDate[selectedTabId])
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [selectedTabId, tasksByDate, immediateFirebaseSave])

  // Initialize Firebase data service when user is authenticated
  useEffect(() => {
    if (user) {
      const service = new FirebaseDataService(user.uid);
      setDataService(service);
    } else {
      setDataService(null);
    }
  }, [user]);

  // Load initial data and sync with Firebase when authenticated
  useEffect(() => {
    const loadData = async () => {
      // Always load local data first
      const { tasks, tabs: tabsData, defaultTabId } = initializeApp(today);
      setTasksByDate(tasks);
      setTabs(tabsData);
      setSelectedTabId(defaultTabId);
      setDataLoaded(true);

      // If user is authenticated, try to sync with Firebase
      if (user && dataService) {
        try {
          console.log('User authenticated, syncing with Firebase...');
          showSyncNotification('Syncing your data with cloud...');
          const { tasks: syncedTasks, tabs: syncedTabs } = await syncDataWithFirebase(dataService);
          setTasksByDate(syncedTasks);
          setTabs(syncedTabs);
          showSuccessNotification('Data synced successfully!');
          
          // Update selected tab if it exists in synced data
          const syncedTabIds = Object.keys(syncedTabs);
          if (syncedTabIds.length > 0) {
            const currentTabExists = syncedTabIds.includes(defaultTabId);
            if (!currentTabExists) {
              setSelectedTabId(syncedTabIds[0]);
            }
          }
        } catch (error) {
          console.error('Failed to sync with Firebase, continuing with local data:', error);
          showErrorNotification('Failed to sync with cloud. Your data is still saved locally.');
        }
      }
    };

    loadData();
  }, [user, dataService, today]);

  useEffect(() => {
    if (dataLoaded && selectedTabId && tasksByDate[selectedTabId]) {
      debouncedFirebaseSave(selectedTabId, tasksByDate[selectedTabId])
    }
  }, [tasksByDate, selectedTabId, dataLoaded, debouncedFirebaseSave])

// Save the last selected tab when it changes
useEffect(() => {
  if (selectedTabId) {
    saveLastSelectedTab(selectedTabId);
  }
}, [selectedTabId]);


const onDeleteTab = (tabId: string) => {
  deleteTabFromStorage(tabId, dataService || undefined);
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
    const newTask: Task = {
      id: Date.now(),
      text,
      notes: "",
      completed: false,
    }
    // Add new task at the beginning of the array
    const updatedTasks = [newTask, ...tasks]
    setTasksByDate(prev => ({ ...prev, [selectedTabId]: updatedTasks }))
  }

  const completeTask = (taskId: number) => {
    const updated = tasksByDate[selectedTabId].map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    // Keep all tasks, just toggle completed state
    setTasksByDate(prev => ({ ...prev, [selectedTabId]: updated }))
  }

  const deleteTask = (taskId: number) => {
    const updated = tasksByDate[selectedTabId].filter(task => task.id !== taskId)
    setTasksByDate(prev => ({ ...prev, [selectedTabId]: updated }))
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
    const updated = tasksByDate[selectedTabId].map(task => {
      if (task.id === taskId) {
        return { ...task, notes }
      }
      return task
    })
    setTasksByDate(prev => ({ ...prev, [selectedTabId]: updated }))
  }

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) || null : null

  return (
    <div className={`flex h-screen overflow-hidden ${currentTheme.colors.background.main} min-w-0`} style={{ minWidth: '768px' }}>
      <LeftPanel
        tabs={Object.values(tabs)} // Convert TabsMap to Tab[]
        activeTabId={selectedTabId}
        onTabClick={setSelectedTabId}
        onRenameTab={(tabId: string, newName: string) => {
          const updatedTabs = renameTab(tabId, newName, dataService || undefined);
          setTabs(updatedTabs);
        }}
        onNewTab={(name: string) => {
          const { tabId, tabs: updatedTabs, tasks: updatedTasks } = createNewTab(name, dataService || undefined);
          setTabs(updatedTabs);
          setTasksByDate(updatedTasks);
          setSelectedTabId(tabId); // Auto-select new tab
        }}
        onDeleteTab={onDeleteTab}
      />

      <div 
        className="flex-1 flex flex-col min-w-0"
        style={{ 
          marginRight: showNotesPanel ? `${rightPanelWidth}px` : '0px',
          transition: 'margin-right 0.05s ease-out'
        }}
      >
        {/* Header with User Profile or Sign In */}
        <div 
          className="flex items-center justify-between p-4 z-auto border-b"
          style={{ 
            backgroundColor: currentTheme.colors.background.panel,
            borderColor: currentTheme.colors.border.light
          }}
        >
          <div>
            <h1 className="text-xl font-bold" style={{ color: currentTheme.colors.text.primary }}>
              Dev Tasks
            </h1>
            <p className="text-sm" style={{ color: currentTheme.colors.text.muted }}>
              {dayjs().format('MMMM D, YYYY')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user ? <UserProfile /> : <SignInButton />}
          </div>
        </div>

        <MiddlePanel
          tasks={tasks}
          addTask={addTask}
          onEditNotes={openNotesPanel}
          onCompleteTask={completeTask}
          onDeleteTask={deleteTask}
          workspaceName={tabs[selectedTabId]?.name || "Tasks"}
        />
      </div>

      <RightPanel
        selectedTask={selectedTask}
        onClose={closeNotesPanel}
        onSaveNotes={saveNotes}
        visible={showNotesPanel}
        onWidthChange={setRightPanelWidth}
      />
    </div>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ProtectedRoute requireAuth={false}>
            <AppContent />
          </ProtectedRoute>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App