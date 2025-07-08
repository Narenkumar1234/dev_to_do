import { TaskMap, TabsMap } from "./types";
import { FirebaseDataService } from "./lib/firebaseDataService";

const LOCAL_KEY = "devtab_tasks_by_date";
const TABS_KEY = "devtab_tabs";
const LAST_SELECTED_TAB_KEY = "devtab_last_selected_tab";

/**
 * Get all tasks from localStorage, or return an empty object if not found.
 */
export const getTasksFromStorage = (): TaskMap => {
  const data = localStorage.getItem(LOCAL_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      console.error("Invalid JSON in localStorage");
    }
  }
  return {};
};

/**
 * Get all tabs from localStorage, or return an empty object if not found.
 */
export const getTabsFromStorage = (): TabsMap => {
  const data = localStorage.getItem(TABS_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      console.error("Invalid JSON in localStorage for tabs");
    }
  }
  return {};
};

/**
 * Save the entire task map back to localStorage.
 */
export const saveTasksToStorage = (taskMap: TaskMap): void => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(taskMap));
};

/**
 * Save the entire tabs map back to localStorage.
 */
export const saveTabsToStorage = (tabsMap: TabsMap): void => {
  localStorage.setItem(TABS_KEY, JSON.stringify(tabsMap));
};

/**
 * Update or insert tasks for a specific tab ID.
 */
export const upsertTasksForTab = (tabId: string, tasks: TaskMap[string], dataService?: FirebaseDataService): void => {
  const current = getTasksFromStorage();
  current[tabId] = tasks;
  saveTasksToStorage(current);
  
  // Invalidate cache since data changed
  invalidateFirebaseCache()
  
  // Save to Firebase if user is authenticated
  if (dataService) {
    dataService.saveTasks(tabId, tasks).catch(error => {
      console.error('Failed to sync tasks to Firebase:', error);
    });
  }
};

/**
 * Delete a tab from localStorage (both tasks and tab info).
 */
export const deleteTabFromStorage = (tabId: string, dataService?: FirebaseDataService): void => {
  const currentTasks = getTasksFromStorage();
  const currentTabs = getTabsFromStorage();
  
  delete currentTasks[tabId];
  delete currentTabs[tabId];
  
  saveTasksToStorage(currentTasks);
  saveTabsToStorage(currentTabs);
  
  // Delete from Firebase if user is authenticated
  if (dataService) {
    dataService.deleteTab(tabId).catch(error => {
      console.error('Failed to delete tab from Firebase:', error);
    });
  }
};

/**
 * Generate a unique ID for a new tab.
 */
export const generateTabId = (): string => {
  return 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Initialize the application state. If no tabs exist, create a default tab for today.
 * If tabs exist, return them and try to use the last selected tab as default.
 */
export const initializeApp = (today: string): { tasks: TaskMap; tabs: TabsMap; defaultTabId: string } => {
  const currentTasks = getTasksFromStorage();
  const currentTabs = getTabsFromStorage();
  
  // Check if any tabs exist
  const tabIds = Object.keys(currentTabs);
  
  if (tabIds.length === 0) {
    // No tabs exist, create today's tab as the default
    const defaultTabId = generateTabId();
    currentTabs[defaultTabId] = { 
      id: defaultTabId, 
      name: today,
      createdAt: new Date().toISOString()
    };
    currentTasks[defaultTabId] = [];
    
    saveTasksToStorage(currentTasks);
    saveTabsToStorage(currentTabs);
    
    return { tasks: currentTasks, tabs: currentTabs, defaultTabId };
  }
  
  // Tabs exist, try to use the last selected tab, otherwise use the first one
  const lastSelectedTabId = getLastSelectedTab();
  let defaultTabId = tabIds[0]; // fallback to first tab
  
  if (lastSelectedTabId && currentTabs[lastSelectedTabId]) {
    defaultTabId = lastSelectedTabId;
  }
  
  return { tasks: currentTasks, tabs: currentTabs, defaultTabId };
};

/**
 * Create a new tab with the given name and insert it at the beginning.
 */
export const createNewTab = (name: string, dataService?: FirebaseDataService): { tabId: string; tabs: TabsMap; tasks: TaskMap } => {
  const tabId = generateTabId();
  const currentTabs = getTabsFromStorage();
  const currentTasks = getTasksFromStorage();
  
  const newTab = { 
    id: tabId, 
    name,
    createdAt: new Date().toISOString()
  };
  
  // Create new tabs object with the new tab first
  const newTabs: TabsMap = {
    [tabId]: newTab,
    ...currentTabs
  };
  
  currentTasks[tabId] = [];
  
  saveTabsToStorage(newTabs);
  saveTasksToStorage(currentTasks);
  
  // Invalidate cache since data changed
  invalidateFirebaseCache()
  
  // Save to Firebase if user is authenticated
  if (dataService) {
    dataService.saveTab(newTab).catch(error => {
      console.error('Failed to sync new tab to Firebase:', error);
    });
  }
  
  return { tabId, tabs: newTabs, tasks: currentTasks };
};

/**
 * Rename a tab (only updates the name, keeps the same ID).
 */
export const renameTab = (tabId: string, newName: string, dataService?: FirebaseDataService): TabsMap => {
  const currentTabs = getTabsFromStorage();
  
  if (currentTabs[tabId]) {
    currentTabs[tabId].name = newName;
    saveTabsToStorage(currentTabs);
    
    // Save to Firebase if user is authenticated
    if (dataService) {
      dataService.saveTab(currentTabs[tabId]).catch(error => {
        console.error('Failed to sync tab rename to Firebase:', error);
      });
    }
  }
  
  return currentTabs;
};

/**
 * Save the last selected tab ID to localStorage.
 */
export const saveLastSelectedTab = (tabId: string): void => {
  localStorage.setItem(LAST_SELECTED_TAB_KEY, tabId);
};

/**
 * Get the last selected tab ID from localStorage.
 */
export const getLastSelectedTab = (): string | null => {
  return localStorage.getItem(LAST_SELECTED_TAB_KEY);
};

/**
 * Sync local data with Firebase for authenticated users
 */
// Cache for Firebase data to prevent unnecessary calls
const dataCache = {
  tasks: null as TaskMap | null,
  tabs: null as TabsMap | null,
  lastFetch: 0,
  cacheTimeout: 5 * 60 * 1000 // 5 minutes cache
}

/**
 * Check if cached data is still valid
 */
const isCacheValid = (): boolean => {
  return Date.now() - dataCache.lastFetch < dataCache.cacheTimeout
}

/**
 * Invalidate the Firebase data cache (call when data changes)
 */
export const invalidateFirebaseCache = (): void => {
  dataCache.tasks = null
  dataCache.tabs = null
  dataCache.lastFetch = 0
  console.log('Firebase cache invalidated')
}

/**
 * Get cache status for debugging
 */
export const getCacheStatus = () => {
  return {
    isValid: isCacheValid(),
    lastFetch: new Date(dataCache.lastFetch).toISOString(),
    cacheAge: Date.now() - dataCache.lastFetch
  }
}

/**
 * Sync local data with Firebase - OPTIMIZED VERSION with caching
 */
export const syncDataWithFirebase = async (dataService: FirebaseDataService): Promise<{ tasks: TaskMap; tabs: TabsMap }> => {
  try {
    // Get local data first
    const localTasks = getTasksFromStorage()
    const localTabs = getTabsFromStorage()
    
    // Check if we can use cached data
    if (isCacheValid() && dataCache.tasks && dataCache.tabs) {
      console.log('Using cached Firebase data')
      return { tasks: dataCache.tasks, tabs: dataCache.tabs }
    }

    console.log('Fetching fresh data from Firebase...')
    
    // Get data from Firebase (parallel calls)
    const [firebaseTasks, firebaseTabs] = await Promise.all([
      dataService.getAllTasks(),
      dataService.getAllTabs()
    ])
    
    // Update cache
    dataCache.tasks = firebaseTasks
    dataCache.tabs = firebaseTabs
    dataCache.lastFetch = Date.now()
    
    // Merge data (Firebase takes precedence)
    const mergedTasks = { ...localTasks, ...firebaseTasks }
    const mergedTabs = { ...localTabs, ...firebaseTabs }
    
    // Save merged data locally
    saveTasksToStorage(mergedTasks)
    saveTabsToStorage(mergedTabs)
    
    // Efficiently sync local-only data (batch operation)
    const localTabIds = Object.keys(localTabs)
    const firebaseTabIds = Object.keys(firebaseTabs)
    const localOnlyTabIds = localTabIds.filter(id => !firebaseTabIds.includes(id))
    
    if (localOnlyTabIds.length > 0) {
      console.log(`Syncing ${localOnlyTabIds.length} local-only tabs to Firebase`)
      
      // Batch the uploads
      const batchOperations = localOnlyTabIds.map(async (tabId) => {
        await dataService.saveTab(localTabs[tabId])
        if (localTasks[tabId]) {
          await dataService.saveTasks(tabId, localTasks[tabId])
        }
      })
      
      await Promise.all(batchOperations)
    }
    
    return { tasks: mergedTasks, tabs: mergedTabs }
  } catch (error) {
    console.error('Failed to sync data with Firebase:', error)
    // Return local data as fallback
    return { tasks: getTasksFromStorage(), tabs: getTabsFromStorage() }
  }
}
