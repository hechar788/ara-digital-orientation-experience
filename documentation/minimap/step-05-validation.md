# Step 5: Quick Validation Pass

Do just enough checking to trust the rapid implementation, then log any follow-ups for a slower clean-up cycle later.

## 5.1 Smoke-test the data inline
- While editing each block file, temporarily add `console.log(photo.id, photo.minimap)` inside the helper from Step 2 to confirm values are being read.
- Run the viewer and click through a handful of transitions—especially elevators—to ensure the dot never vanishes when coordinates exist.
- If a coordinate looks wildly off, tweak it immediately while the context is fresh, then move on.

## 5.2 Sanity-check both minimap views
- Open the compact minimap, expand it, and verify the marker appears in the same relative spot on both canvases.
- Resize the browser window once or twice; the dot should stay glued to the intended location thanks to the relative overlay logic.
- Toggle minimap open/closed rapidly to ensure no stale coordinates remain in state after collapse.

## 5.3 Leave breadcrumbs for future hardening
- Drop a `// TODO: tighten minimap coordinate coverage with tests` comment near the helper in `blockUtils` so the next person knows where to add guardrails.
- Create a short follow-up note (issue, TODO, or checklist item) listing any photos you skipped or approximated so they can be dialled in later.
- When time allows, plan to convert these ad-hoc checks into Vitest coverage—but that is outside the scope of this quick implementation.
