import { useState, useRef } from 'react'
import { ChevronRight, X } from 'lucide-react'

interface PopoutMenuProps {
  className?: string
}

export function PopoutMenu({ className = '' }: PopoutMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)


  return (
    <>
      {/* Overlay to close menu when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onPointerDown={() => setIsOpen(false)}
          onTouchStart={() => setIsOpen(false)}
        />
      )}
      
      <div className={`fixed left-0 top-0 h-screen z-50 ${className}`} ref={menuRef}>
        <div className={`flex items-stretch h-full transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="bg-white shadow-lg border border-l-0 min-w-48 flex flex-col h-full relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 transition-colors z-10 cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            <div className="p-4 pt-8 space-y-2 flex-1">
              <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors cursor-pointer">
                Button 1
              </button>
              <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors cursor-pointer">
                Button 2
              </button>
              <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors cursor-pointer">
                Button 3
              </button>
            </div>
          </div>
        </div>
        
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-r-lg border border-l-0 px-2.5 py-7 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>
    </>
  )
}