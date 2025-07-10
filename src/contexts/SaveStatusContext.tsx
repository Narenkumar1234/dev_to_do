import React, { createContext, useContext, useState, useCallback } from 'react';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface SaveStatusContextType {
  status: SaveStatus;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  markUnsaved: () => void;
  markSaving: () => void;
  markSaved: () => void;
  markError: () => void;
  manualSaveTriggered: boolean;
  triggerManualSave: () => void;
  resetManualSave: () => void;
}

const SaveStatusContext = createContext<SaveStatusContextType | undefined>(undefined);

export const useSaveStatus = () => {
  const context = useContext(SaveStatusContext);
  if (context === undefined) {
    throw new Error('useSaveStatus must be used within a SaveStatusProvider');
  }
  return context;
};

export const SaveStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<SaveStatus>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [manualSaveTriggered, setManualSaveTriggered] = useState(false);

  const markUnsaved = useCallback(() => {
    setStatus('unsaved');
    setHasUnsavedChanges(true);
  }, []);

  const markSaving = useCallback(() => {
    setStatus('saving');
  }, []);

  const markSaved = useCallback(() => {
    setStatus('saved');
    setHasUnsavedChanges(false);
    setLastSaved(new Date());
  }, []);

  const markError = useCallback(() => {
    setStatus('error');
  }, []);

  const triggerManualSave = useCallback(() => {
    setManualSaveTriggered(true);
  }, []);

  const resetManualSave = useCallback(() => {
    setManualSaveTriggered(false);
  }, []);

  const value: SaveStatusContextType = {
    status,
    lastSaved,
    hasUnsavedChanges,
    markUnsaved,
    markSaving,
    markSaved,
    markError,
    manualSaveTriggered,
    triggerManualSave,
    resetManualSave,
  };

  return (
    <SaveStatusContext.Provider value={value}>
      {children}
    </SaveStatusContext.Provider>
  );
};
