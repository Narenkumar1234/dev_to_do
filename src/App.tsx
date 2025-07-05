import { useEffect, useState } from "react"
import dayjs from "dayjs"
import LeftPanel from "./components/LeftPanel"
import MiddlePanel from "./components/MiddlePanel"
import RightPanel from "./components/RightPanel"
import { Task, TaskMap, Tab, TabsMap } from "./types"
import { ThemeProvider, useTheme } from "./contexts/ThemeContext"
import "./styles.css"
import {
  upsertTasksForTab,
  deleteTabFromStorage,
  initializeApp,
  createNewTab,
  renameTab,
  saveLastSelectedTab,
  getTasksFromStorage,
  getTabsFromStorage
} from "./utils";

const AppContent = () => {
  const { currentTheme } = useTheme()
  const today = dayjs().format("DD-MMM-YY")

  const [dataLoaded, setDataLoaded] = useState(false);
  const [tasksByDate, setTasksByDate] = useState<TaskMap>({})
  const [tabs, setTabs] = useState<TabsMap>({})
  const [selectedTabId, setSelectedTabId] = useState<string>("")
  const [showNotesPanel, setShowNotesPanel] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  
  const tasks = tasksByDate[selectedTabId] || []

useEffect(() => {
  const { tasks, tabs: tabsData, defaultTabId } = initializeApp(today);
  setTasksByDate(tasks);
  setTabs(tabsData);
  setSelectedTabId(defaultTabId);
  setDataLoaded(true);
}, []);


useEffect(() => {
  if (dataLoaded && selectedTabId) {
    upsertTasksForTab(selectedTabId, tasksByDate[selectedTabId]);
  }
}, [tasksByDate, selectedTabId, dataLoaded]);

// Save the last selected tab when it changes
useEffect(() => {
  if (selectedTabId) {
    saveLastSelectedTab(selectedTabId);
  }
}, [selectedTabId]);


const onDeleteTab = (tabId: string) => {
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
    <div className={`flex h-screen overflow-hidden ${currentTheme.colors.background.main}`}>
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

      <MiddlePanel
        tasks={tasks}
        addTask={addTask}
        onEditNotes={openNotesPanel}
        onCompleteTask={completeTask}
        onDeleteTask={deleteTask}
      />

      <RightPanel
        selectedTask={selectedTask}
        onClose={closeNotesPanel}
        onSaveNotes={saveNotes}
        visible={showNotesPanel}
      />
    </div>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App