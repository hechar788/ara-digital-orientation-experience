# Step 2: Project Catalogue Coordinates

Hook the new catalogue into small utilities so components can look up coordinates instantly while you continue to fill them in.

## 2.1 Normalise coordinate expectations
- Decide on a consistent coordinate system (recommended: values between 0 and 1 measured against the minimap image’s width and height, origin at top-left).
- Document that convention at the top of `minimapLocations.ts` so anyone editing the file knows how to translate pixel measurements into normalized values.
- Add a `type NormalizedCoordinate = number` alias if it helps readability when scanning the catalogue.

## 2.2 Expose read helpers
- In `src/data/minimap/minimapLocations.ts`, export a function `getMinimapCoordinate(photoId: string)` that returns the entry or `null` if still unset.
- Export another helper `listUnmappedPhotoIds()` that filters the catalogue for coordinates still using `null`, providing a fast way to track progress.
- Keep helpers side-effect free so they can be imported anywhere without accidentally mutating data.

## 2.3 Bridge to tour utilities
- Create `src/data/minimap/minimapUtils.ts` that re-exports the helpers above and adds a convenience method `resolveMinimapCoordinate(photoId: string)` returning `{ photoId, coordinate }`.
- Import this utility wherever `blockUtils` consumers already live (e.g., `Minimap.tsx`) so you do not have to thread catalogue access through multiple layers.
- Add minimal unit tests later if desired; for now, focus on making the API ergonomic while keeping the implementation tiny.

## 2.4 Prepare for bulk updates
- Optionally add a development-only script (Node/TS) that prints `listUnmappedPhotoIds()` so you can tackle coordinates area-by-area without hunting manually.
- When editing coordinates, use comments inside the catalogue to group related photos (e.g., `// A Block Floor 1`).
- Because the helpers read straight from the exported record, the minimap UI will update as soon as you edit the file—no extra build steps required.
