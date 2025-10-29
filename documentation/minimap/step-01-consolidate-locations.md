# Step 1: Build the Minimap Location Catalogue

Create a dedicated TypeScript data module that lists every tour photo alongside a placeholder minimap coordinate so updates live in one easy-to-edit file.

## 1.1 Add a minimap data directory
- Create `src/data/minimap/` (if it does not already exist) to hold all minimap-specific data files.
- Inside that folder, add `minimapLocations.ts` with a `MinimapCoordinate` interface (`{ x: number | null; y: number | null }`) and a `MinimapLocation` type describing the shape of each entry.
- Export a `MINIMAP_LOCATIONS` record keyed by `photoId`, keeping values initialised to `{ x: null, y: null }` so the file compiles even before coordinates are filled in.

## 1.2 Enumerate every tour photo
- Import `getAllAreas()` from `src/data/blockUtils.ts` and iterate through its result to gather every `photoId` at module load.
- For each photo, create a default entry in `MINIMAP_LOCATIONS` if one does not already exist—this guarantees the catalogue stays in sync with the tour content.
- Leave a `// TODO: supply coordinates` comment beside the exported record so contributors know where to update positions later.

## 1.3 Provide lookup helpers
- Export `getMinimapCoordinate(photoId: string)` that returns the coordinate (or `null` if still unassigned) straight from the record.
- Export `MINIMAP_LOCATION_ENTRIES` (an array of `[photoId, coordinate]`) for convenience when future overlays need to iterate all markers.
- Document both helpers using the repository’s JSDoc format so their purpose and usage stay crystal clear.

## 1.4 Keep editing lightweight
- Because coordinates now live in a single file, you can scroll through `minimapLocations.ts`, filter by building, and update multiple entries quickly.
- When adding new tour photos, simply re-run the catalogue initialisation (importing the file is enough) to auto-insert the new IDs with null coordinates.
- Commit frequently after each block’s coordinates are filled in; diff noise stays limited to the minimap directory rather than the source tour files.
