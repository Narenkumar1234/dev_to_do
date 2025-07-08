import React, { useState, useEffect } from 'react'
import { getCacheStatus } from '../utils-firebase'

interface FirebaseDebugPanelProps {
  show: boolean
  onClose: () => void
}

const FirebaseDebugPanel: React.FC<FirebaseDebugPanelProps> = ({ show, onClose }) => {
  const [cacheStatus, setCacheStatus] = useState<any>(null)
  const [callCount, setCallCount] = useState(0)

  useEffect(() => {
    if (show) {
      const interval = setInterval(() => {
        setCacheStatus(getCacheStatus())
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [show])

  if (!show) return null

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg z-50 w-80">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Firebase Debug</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Cache Status:</strong>
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            cacheStatus?.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {cacheStatus?.isValid ? 'Valid' : 'Invalid'}
          </span>
        </div>
        
        {cacheStatus && (
          <>
            <div>
              <strong>Last Fetch:</strong> {new Date(cacheStatus.lastFetch).toLocaleTimeString()}
            </div>
            <div>
              <strong>Cache Age:</strong> {Math.floor(cacheStatus.cacheAge / 1000)}s
            </div>
          </>
        )}
        
        <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <div className="text-xs text-gray-600 dark:text-gray-300">
            💡 <strong>Tip:</strong> Cache prevents unnecessary Firebase calls for 5 minutes after fetch.
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <div className="text-xs text-blue-600 dark:text-blue-300">
            📊 Open Network tab to monitor Firebase calls in real-time.
          </div>
        </div>
      </div>
    </div>
  )
}

export default FirebaseDebugPanel
