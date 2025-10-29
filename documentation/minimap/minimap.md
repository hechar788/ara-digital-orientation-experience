# Minimap Implementation Plan

Centralise minimap coordinates in a dedicated TypeScript catalogue, wire them into the existing store, and render the blue dot overlay without touching the tour data files.

## Step Overview
1. [Step 1 – Build the Minimap Location Catalogue](./step-01-consolidate-locations.md): Generate a `MINIMAP_LOCATIONS` record containing every photo ID and placeholder coordinates.
2. [Step 2 – Project Catalogue Coordinates](./step-02-map-projection.md): Provide helper functions that expose the data and define the normalised coordinate system.
3. [Step 3 – Wire Coordinates into the Minimap Store](./step-03-state-management.md): Track the active photo and its coordinate through the existing store/hook.
4. [Step 4 – Drop Markers on the Existing Minimap](./step-04-ui-rendering.md): Overlay the blue dot in both minimap views using the helper lookups.
5. [Step 5 – Quick Validation Pass](./step-05-validation.md): Manually confirm the markers render and note any outstanding coordinates for later tuning.

## Implementation Checklist
- [x] Step 1 complete – `src/data/minimap/minimapLocations.ts` exports catalogue entries for every photo ID.
- [x] Step 2 complete – Helper functions resolve coordinates and list unmapped photo IDs.
- [x] Step 3 complete – Minimap store tracks `activePhotoId` and `activeCoordinate`, updated from the viewer.
- [x] Step 4 complete – Blue dot overlay renders in compact and expanded minimap views.
- [ ] Step 5 complete – Smoke tests run and missing coordinates logged for follow-up.
