import { AlertCircle, X } from 'lucide-react'

interface PlaceholderAIChatProps {
  isOpen: boolean
  onClose: () => void
  currentPhotoId: string
}

export const PlaceholderAIChat: React.FC<PlaceholderAIChatProps> = ({ isOpen, onClose, currentPhotoId }) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-dashed border-blue-400/60 bg-slate-900/95 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-blue-100/70 transition hover:bg-blue-800/60 hover:text-blue-100"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-500/20 p-2 text-blue-200">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-2 text-blue-100">
            <h3 className="text-lg font-semibold">AI Navigation Coming Soon</h3>
            <p className="text-sm text-blue-100/80">
              Copilot Studio will power the guided navigation experience. For now this placeholder confirms the current
              location (<span className="font-mono text-blue-200">{currentPhotoId}</span>) and keeps the UI wiring intact.
            </p>
            <p className="text-xs text-blue-100/60">This button will launch the Copilot Web Chat once the integration phase is complete.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
