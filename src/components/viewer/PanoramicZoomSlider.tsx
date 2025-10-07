/**
 * Panoramic Zoom Slider Component
 *
 * Provides zoom controls for the panoramic viewer using FOV (Field of View).
 * Lower FOV = more zoomed in, Higher FOV = more zoomed out.
 *
 * @fileoverview Zoom slider control for panoramic viewer
 */

import React from 'react'
import { Minus, Plus } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Props for PanoramicZoomSlider component
 *
 * @property currentFov - Current field of view value (10-120)
 * @property onZoomChange - Callback when zoom value changes
 * @property className - Optional CSS classes
 */
interface PanoramicZoomSliderProps {
  currentFov: number
  onZoomChange: (fov: number) => void
  className?: string
}

/**
 * Zoom slider control for panoramic viewer
 *
 * Displays a slider with zoom in/out buttons and percentage indicator.
 * FOV range: 10 (max zoom) to 120 (max zoom out).
 * Percentage displayed: 0% (zoomed out) to 100% (zoomed in).
 *
 * @param currentFov - Current FOV value
 * @param onZoomChange - Handler for FOV changes
 * @param className - Additional CSS classes
 * @returns Zoom slider component
 *
 * @example
 * ```typescript
 * <PanoramicZoomSlider
 *   currentFov={75}
 *   onZoomChange={(fov) => setFov(fov)}
 * />
 * ```
 */
export const PanoramicZoomSlider: React.FC<PanoramicZoomSliderProps> = ({
  currentFov,
  onZoomChange,
  className
}) => {
  const minFov = 10
  const maxFov = 120

  const handleZoomIn = () => {
    const newFov = Math.max(minFov, currentFov - 10)
    onZoomChange(newFov)
  }

  const handleZoomOut = () => {
    const newFov = Math.min(maxFov, currentFov + 10)
    onZoomChange(newFov)
  }

  // Convert FOV to percentage (inverted: lower FOV = higher zoom %)
  const getZoomPercentage = () => {
    return Math.round(((maxFov - currentFov) / (maxFov - minFov)) * 100)
  }

  // Convert FOV to zoom level (0-110 range, where higher = more zoomed in)
  const zoomLevel = maxFov - currentFov

  return (
    <div
      className={cn(
        'flex gap-1 rounded-md bg-black/70 p-2 text-white',
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleZoomOut}
        disabled={currentFov >= maxFov}
        className="h-8 w-8 text-white hover:bg-white/10 disabled:opacity-50 cursor-pointer"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Slider
        className="w-[140px] cursor-pointer [&_[data-slot=slider-track]]:bg-gray-600 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:cursor-pointer"
        value={[zoomLevel]}
        min={0}
        max={maxFov - minFov}
        step={1}
        onValueChange={(values) => {
          const newFov = maxFov - values[0]
          onZoomChange(newFov)
        }}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleZoomIn}
        disabled={currentFov <= minFov}
        className="h-8 w-8 text-white hover:bg-white/10 disabled:opacity-50 cursor-pointer"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        className="min-w-16 tabular-nums h-8 text-white hover:bg-white/10 cursor-pointer"
        variant="ghost"
        onClick={() => onZoomChange(75)}
      >
        {getZoomPercentage()}%
      </Button>
    </div>
  )
}
