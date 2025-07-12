import { useEffect, useState, useRef, useCallback } from "react"
import dayjs from "dayjs"
import LeftPanel from "./components/LeftPanel"
import MiddlePanel from "./components/MiddlePanel"
import RightPanel from "./components/RightPanel"
import UserProfile from "./components/UserProfile"
import SignInButton from "./components/SignInButton"
import ProtectedRoute from "./components/ProtectedRoute"
import VizgoLogo from "./components/VizgoLogo"
import { Task, TaskMap, Tab, TabsMap } from "./types"
import { ThemeProvider, useTheme } from "./contexts/ThemeContext"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { NotificationProvider, useNotification } from "./contexts/NotificationContext"
import { SaveStatusProvider, useSaveStatus } from "./contexts/SaveStatusContext"
import { FirebaseDataService } from "./lib/firebaseDataService"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"
import SaveStatusIndicator from "./components/SaveStatusIndicator"
import "./styles.css"
import {
  upsertTasksForTab,
  deleteTabFromStorage,
  initializeApp,
  createNewTab,
  renameTab,
  saveLastSelectedTab,
  smartInitialSync
} from "./utils-firebase";

const AppContent = () => {
  const { currentTheme } = useTheme()
  const { user } = useAuth()
  const { showSyncNotification, showSuccessNotification, showErrorNotification } = useNotification()
  const { markUnsaved, markSaving, markSaved, markError, manualSaveTriggered, resetManualSave } = useSaveStatus()
  const today = dayjs().format("DD-MMM-YY")

  const [dataLoaded, setDataLoaded] = useState(false);
  const [tasksByDate, setTasksByDate] = useState<TaskMap>({})
  const [tabs, setTabs] = useState<TabsMap>({})
  const [selectedTabId, setSelectedTabId] = useState<string>("")
  const [showNotesPanel, setShowNotesPanel] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [dataService, setDataService] = useState<FirebaseDataService | null>(null)
  
  const tasks = tasksByDate[selectedTabId] || []

  // Manual save function - only saves to cloud when explicitly called
  const manualSaveToCloud = useCallback(async () => {
    if (!dataService || !selectedTabId) {
      markError();
      showErrorNotification('Cannot save: not authenticated or no workspace selected');
      return;
    }

    try {
      markSaving();
      
      // Save both tasks and tab info in a single batch operation
      const currentTasks = tasksByDate[selectedTabId] || [];
      const currentTab = tabs[selectedTabId];
      
      if (currentTab) {
        await dataService.manualSave(selectedTabId, currentTasks, currentTab);
      } else {
        // Fallback if tab doesn't exist
        await dataService.saveCurrentTabTasks(selectedTabId, currentTasks);
      }
      
      markSaved();
      showSuccessNotification('Successfully saved to cloud!');
      console.log('✅ Manual save completed');
    } catch (error) {
      markError();
      showErrorNotification('Failed to save to cloud');
      console.error('❌ Manual save failed:', error);
    }
  }, [dataService, selectedTabId, tasksByDate, tabs, markSaving, markSaved, markError, showSuccessNotification, showErrorNotification]);

  // Handle manual save trigger
  useEffect(() => {
    if (manualSaveTriggered) {
      manualSaveToCloud();
      resetManualSave();
    }
  }, [manualSaveTriggered, manualSaveToCloud, resetManualSave]);

  // Keyboard shortcut for manual save
  useKeyboardShortcuts({
    onSave: manualSaveToCloud,
    enabled: !!user && !!dataService
  });

  // Initialize Firebase data service when user is authenticated
  useEffect(() => {
    if (user) {
      const service = new FirebaseDataService(user.uid);
      setDataService(service);
    } else {
      setDataService(null);
    }
  }, [user]);

  // Load initial data and sync with Firebase when authenticated (only run once)
  useEffect(() => {
    const loadData = async () => {
      // Always load local data first
      const { tasks, tabs: tabsData, defaultTabId } = initializeApp(today);
      setTasksByDate(tasks);
      setTabs(tabsData);
      setSelectedTabId(defaultTabId);
      setDataLoaded(true);

      // If user is authenticated, try to sync with Firebase (with smart caching)
      if (user && dataService) {
        try {
          console.log('User authenticated, checking if sync needed...');
          
          // Check if we have recent local data and user just refreshed
          const hasLocalData = Object.keys(tasks).length > 0 || Object.keys(tabsData).length > 0
          const syncKey = `lastSync_${user.uid}`
          const lastSyncTime = sessionStorage.getItem(syncKey)
          const isRecentRefresh = lastSyncTime && 
            Date.now() - parseInt(lastSyncTime) < 5 * 60 * 1000 // 5 minutes
          
          if (hasLocalData && isRecentRefresh) {
            console.log('Using local data, skipping sync (recent refresh detected)');
            return
          }
          
          showSyncNotification('Syncing your data with cloud...');
          const { tasks: syncedTasks, tabs: syncedTabs } = await smartInitialSync(dataService);
          
          // Store sync timestamp per user
          sessionStorage.setItem(syncKey, Date.now().toString())
          
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

    // Only run on initial mount and when user/dataService first become available
    if (!dataLoaded) {
      loadData();
    }
  }, [user, dataService, today, dataLoaded, showSyncNotification, showSuccessNotification, showErrorNotification]);

  // Save the last selected tab when it changes
  useEffect(() => {
    if (selectedTabId) {
      saveLastSelectedTab(selectedTabId);
    }
  }, [selectedTabId]);  const onDeleteTab = (tabId: string) => {
    deleteTabFromStorage(tabId, dataService || undefined); // Restore auto-save
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
    // Save to localStorage immediately and mark as unsaved for cloud
    upsertTasksForTab(selectedTabId, updatedTasks, undefined)
    markUnsaved()
  }

  const completeTask = (taskId: number) => {
    const updated = tasksByDate[selectedTabId].map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    // Keep all tasks, just toggle completed state
    setTasksByDate(prev => ({ ...prev, [selectedTabId]: updated }))
    // Save to localStorage immediately and mark as unsaved for cloud
    upsertTasksForTab(selectedTabId, updated, undefined)
    markUnsaved()
  }

  const deleteTask = (taskId: number) => {
    const updated = tasksByDate[selectedTabId].filter(task => task.id !== taskId)
    setTasksByDate(prev => ({ ...prev, [selectedTabId]: updated }))
    // Save to localStorage immediately and mark as unsaved for cloud
    upsertTasksForTab(selectedTabId, updated, undefined)
    markUnsaved()
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
    // Save to localStorage immediately and mark as unsaved for cloud
    upsertTasksForTab(selectedTabId, updated, undefined)
    markUnsaved()
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
          markUnsaved(); // Mark as unsaved when workspace is renamed
        }}
        onNewTab={(name: string) => {
          const { tabId, tabs: updatedTabs, tasks: updatedTasks } = createNewTab(name, dataService || undefined);
          setTabs(updatedTabs);
          setTasksByDate(updatedTasks);
          setSelectedTabId(tabId); // Auto-select new tab
          markUnsaved(); // Mark as unsaved when new workspace is created
        }}
        onDeleteTab={onDeleteTab}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with User Profile or Sign In */}
        <div 
          className="flex items-center justify-between p-4 z-auto border-b"
          style={{ 
            backgroundColor: currentTheme.colors.background.panel,
            borderColor: currentTheme.colors.border.light
          }}
        >
          <div className="flex items-center gap-3">
            <VizgoLogo size={40} className={currentTheme.colors.primary.text} />
          </div>
          <div className="flex items-center gap-4">
            <SaveStatusIndicator />
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
          selectedTaskId={selectedTaskId}
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
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <SaveStatusProvider>
            <ProtectedRoute requireAuth={false}>
              <AppContent />
            </ProtectedRoute>
          </SaveStatusProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App