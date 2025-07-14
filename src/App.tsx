import { useEffect, useState, useRef, useCallback } from "react"
import dayjs from "dayjs"
import LeftPanel from "./components/LeftPanel"
import MiddlePanel from "./components/MiddlePanel"
import RightPanel from "./components/RightPanel"
import UserProfile from "./components/UserProfile"
import SignInButton from "./components/SignInButton"
import ProtectedRoute from "./components/ProtectedRoute"
import VizgoLogo from "./components/VizgoLogo"
import QuotaWarning from "./components/QuotaWarning"
import { Task, TaskMap, Tab, TabsMap } from "./types"
import { ThemeProvider, useTheme } from "./contexts/ThemeContext"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { NotificationProvider, useNotification } from "./contexts/NotificationContext"
import { SaveStatusProvider, useSaveStatus } from "./contexts/SaveStatusContext"
import { FirebaseDataService } from "./lib/firebaseDataService"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"
import { useQuotaManager } from "./hooks/useQuotaManager"
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
  const [showQuotaWarning, setShowQuotaWarning] = useState(false)
  
  const tasks = tasksByDate[selectedTabId] || []
  
  // Initialize quota manager
  const { quota, quotaStatus, incrementReads, incrementWrites, getQuotaWarning } = useQuotaManager(tasksByDate, tabs);

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

  // Show quota warning when needed
  useEffect(() => {
    if (quotaStatus.warningMessage && user) {
      setShowQuotaWarning(true);
    }
  }, [quotaStatus.warningMessage, user]);

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
    // Check quota before creating task
    const quotaError = getQuotaWarning('task');
    if (quotaError) {
      showErrorNotification(quotaError);
      return;
    }

    if (!quotaStatus.canWrite) {
      const writeError = getQuotaWarning('write');
      if (writeError) {
        showErrorNotification(writeError);
        return;
      }
    }

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
    // Save to localStorage immediately and mark as unsaved for cloud
    upsertTasksForTab(selectedTabId, updatedTasks, undefined)
    incrementWrites()
    markUnsaved()
  }

  const completeTask = (taskId: number) => {
    const now = new Date().toISOString();
    const updated = tasksByDate[selectedTabId].map(task =>
      task.id === taskId ? { ...task, completed: !task.completed, lastModified: now } : task
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
    const now = new Date().toISOString();
    const updated = tasksByDate[selectedTabId].map(task => {
      if (task.id === taskId) {
        return { ...task, notes, lastModified: now }
      }
      return task
    })
    setTasksByDate(prev => ({ ...prev, [selectedTabId]: updated }))
    
    // Save to localStorage immediately (this is the "local save")
    upsertTasksForTab(selectedTabId, updated, undefined)
    
    // Mark as locally saved, indicating cloud sync might be needed later
    markSaved()
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
          <div className="flex items-center gap-1 flex-shrink-0">
            <SaveStatusIndicator />
            {user ? <UserProfile /> : <SignInButton />}
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
              <SaveStatusIndicator />
              {user ? <UserProfile /> : <SignInButton />}
            </div>
          </div>

          {/* Quota Warning */}
          {quota && quotaStatus.warningMessage && showQuotaWarning && (
            <div className="p-4">
              <QuotaWarning
                quota={quota}
                warningMessage={quotaStatus.warningMessage}
                onClose={() => setShowQuotaWarning(false)}
              />
            </div>
          )}

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
            const updatedTabs = renameTab(tabId, newName, dataService || undefined);
            setTabs(updatedTabs);
            markUnsaved();
          }}
          onNewTab={(name: string) => {
            const { tabId, tabs: updatedTabs, tasks: updatedTasks } = createNewTab(name, dataService || undefined);
            setTabs(updatedTabs);
            setTasksByDate(updatedTasks);
            setSelectedTabId(tabId);
            markUnsaved();
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