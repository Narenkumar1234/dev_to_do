import { TaskMap, TabsMap } from "./types";

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
export const upsertTasksForTab = (tabId: string, tasks: TaskMap[string]): void => {
  const current = getTasksFromStorage();
  current[tabId] = tasks;
  saveTasksToStorage(current);
};

/**
 * Delete a tab from localStorage (both tasks and tab info).
 */
export const deleteTabFromStorage = (tabId: string): void => {
  const currentTasks = getTasksFromStorage();
  const currentTabs = getTabsFromStorage();
  
  delete currentTasks[tabId];
  delete currentTabs[tabId];
  
  saveTasksToStorage(currentTasks);
  saveTabsToStorage(currentTabs);
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
    currentTabs[defaultTabId] = { id: defaultTabId, name: today };
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
export const createNewTab = (name: string): { tabId: string; tabs: TabsMap; tasks: TaskMap } => {
  const tabId = generateTabId();
  const currentTabs = getTabsFromStorage();
  const currentTasks = getTasksFromStorage();
  
  // Create new tabs object with the new tab first
  const newTabs: TabsMap = {
    [tabId]: { id: tabId, name },
    ...currentTabs
  };
  
  currentTasks[tabId] = [];
  
  saveTabsToStorage(newTabs);
  saveTasksToStorage(currentTasks);
  
  return { tabId, tabs: newTabs, tasks: currentTasks };
};

/**
 * Rename a tab (only updates the name, keeps the same ID).
 */
export const renameTab = (tabId: string, newName: string): TabsMap => {
  const currentTabs = getTabsFromStorage();
  
  if (currentTabs[tabId]) {
    currentTabs[tabId].name = newName;
    saveTabsToStorage(currentTabs);
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
