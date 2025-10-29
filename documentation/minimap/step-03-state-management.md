# Step 3: Wire Coordinates into the Minimap Store

Feed the catalogue data through the existing store with minimal disruption so the UI can access the current location and coordinates in one place.

## 3.1 Extend store state
- Update `MinimapState` in `src/stores/minimapStore.ts` to include `activePhotoId: string | null` and `activeCoordinate: MinimapCoordinate | null`.
- Keep the initial state simple: `{ isOpen: false, activePhotoId: null, activeCoordinate: null }`.
- Export a helper `setMinimapActive(photoId: string | null, coordinate: MinimapCoordinate | null)` that updates both fields in one call.

## 3.2 Update the store API surface
- Adjust `useMinimapStore()` (in `src/hooks/useMinimapStore.ts`) so it exposes the new state values and setters alongside the existing `isOpen` helpers.
- Preserve backward compatibility by keeping `setOpen` and `getOpen` working exactly as before.
- Document the new fields with in-line JSDoc so future code readers understand they come from the catalogue module.

## 3.3 Sync viewer state to the store
- Inside `Minimap.tsx`, use `useEffect` to call `setMinimapActive(currentPhotoId, resolveMinimapCoordinate(currentPhotoId))` whenever `currentPhotoId` changes.
- If the helper returns `null`, still set the `activePhotoId` so data consumers can tell which photo is in view even without coordinates yet.
- Log a development-only warning when coordinates are missing to help prioritise gaps while you enter real values.

## 3.4 Keep everything lightweight
- Skip fancy selectors or memoization—the store now only tracks three fields, so direct usage is fine.
- Defer persistence or history tracking until a later iteration; the current goal is simply to share the active coordinate between UI surfaces.
- Note any future ideas (e.g., storing discovered markers) in TODO comments rather than complicating the store now.
