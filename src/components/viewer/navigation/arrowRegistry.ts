import type { DirectionType } from '@/types/tour'

/**
 * Service for recording the exact orientation angles used when rendering
 * directional arrows inside the panoramic viewer. During automated navigation
 * (for example when the AI walks a path), the navigation hook queries this
 * registry to orient the camera using the same angles the user sees for the
 * 3D arrows, guaranteeing visual alignment.
 */

type ArrowKey = `${string}|${DirectionType}`

type ArrowListener = (event: {
  photoId: string
  direction: DirectionType
  angle: number
}) => void

const arrowAngleRegistry = new Map<ArrowKey, number>()
const listeners = new Set<ArrowListener>()

/**
 * Record the render angle for a specific arrow belonging to a photo.
 *
 * @param photoId - Identifier of the photo where the arrow is rendered
 * @param direction - Navigation direction represented by the arrow
 * @param angle - Absolute angle in degrees used to position the arrow
 */
export function registerArrowAngle(photoId: string, direction: DirectionType, angle: number): void {
  arrowAngleRegistry.set(createKey(photoId, direction), angle)
  listeners.forEach(listener => listener({ photoId, direction, angle }))
}

/**
 * Remove cached arrow angles for a given photo. Called when arrows are
 * re-rendered or the user leaves a scene.
 *
 * @param photoId - Identifier of the photo whose arrow angles should be purged
 */
export function unregisterArrowAngles(photoId: string): void {
  arrowAngleRegistry.forEach((_, key) => {
    if (key.startsWith(`${photoId}|`)) {
      arrowAngleRegistry.delete(key)
    }
  })
}

/**
 * Retrieve the stored arrow angle for a photo/direction pair.
 *
 * @param photoId - Identifier of the photo currently being viewed
 * @param direction - Navigation direction to look up
 * @returns Angle in degrees when available, otherwise undefined
 */
export function getArrowAngle(photoId: string, direction: DirectionType): number | undefined {
  return arrowAngleRegistry.get(createKey(photoId, direction))
}

/**
 * Subscribe to arrow angle registration events.
 *
 * @param listener - Callback invoked whenever an arrow angle is registered
 * @returns Cleanup function to remove the listener
 */
export function subscribeArrowAngles(listener: ArrowListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function createKey(photoId: string, direction: DirectionType): ArrowKey {
  return `${photoId}|${direction}`
}
