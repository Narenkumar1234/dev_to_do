import { TaskMap } from "./types";

const LOCAL_KEY = "devtab_tasks_by_date";

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
 * Save the entire task map back to localStorage.
 */
export const saveTasksToStorage = (taskMap: TaskMap): void => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(taskMap));
};

/**
 * Update or insert tasks for a specific date.
 */
export const upsertTasksForDate = (date: string, tasks: TaskMap[string]): void => {
  const current = getTasksFromStorage();
  current[date] = tasks;
  saveTasksToStorage(current);
};

/**
 * Delete a tab (date key) from localStorage.
 */
export const deleteTabFromStorage = (tab: string): void => {
  const current = getTasksFromStorage();
  delete current[tab];
  saveTasksToStorage(current);
};

/**
 * Ensure today's date key exists in localStorage, add if missing.
 */
export const ensureTodayExists = (today: string): TaskMap => {
  const current = getTasksFromStorage();
  if (!current[today]) {
    current[today] = [];
    saveTasksToStorage(current);
  }
  return current;
};
