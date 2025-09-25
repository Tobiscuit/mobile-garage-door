'use client'

import { useState } from 'react'

export default function Home() {
  const [doorStatus, setDoorStatus] = useState<'open' | 'closed' | 'opening' | 'closing'>('closed')
  const [isLoading, setIsLoading] = useState(false)

  const toggleDoor = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (doorStatus === 'closed') {
      setDoorStatus('opening')
      setTimeout(() => setDoorStatus('open'), 2000)
    } else if (doorStatus === 'open') {
      setDoorStatus('closing')
      setTimeout(() => setDoorStatus('closed'), 2000)
    }
    
    setIsLoading(false)
  }

  const getStatusColor = () => {
    switch (doorStatus) {
      case 'open': return 'text-green-600'
      case 'closed': return 'text-red-600'
      case 'opening': return 'text-yellow-600'
      case 'closing': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusText = () => {
    switch (doorStatus) {
      case 'open': return 'Open'
      case 'closed': return 'Closed'
      case 'opening': return 'Opening...'
      case 'closing': return 'Closing...'
      default: return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Garage Door Control
        </h1>
        
        <div className="mb-8">
          <div className={`text-4xl font-bold ${getStatusColor()} mb-2`}>
            {getStatusText()}
          </div>
          <div className="text-gray-600">
            Current Status
          </div>
        </div>

        <button
          onClick={toggleDoor}
          disabled={isLoading || doorStatus === 'opening' || doorStatus === 'closing'}
          className={`
            w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors
            ${isLoading || doorStatus === 'opening' || doorStatus === 'closing'
              ? 'bg-gray-400 cursor-not-allowed'
              : doorStatus === 'open'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
            }
          `}
        >
          {isLoading ? 'Processing...' : doorStatus === 'open' ? 'Close Door' : 'Open Door'}
        </button>

        <div className="mt-6 text-sm text-gray-500">
          Tap the button above to control your garage door
        </div>
      </div>
    </div>
  )
}
