# Step 4: Drop Markers on the Existing Minimap

Layer a simple absolutely positioned element over the current minimap art so coordinates instantly translate into pixels.

## 4.1 Add a quick overlay div
- In `Minimap.tsx`, wrap the existing `<img>` tag with a `relative` container and create an absolutely positioned overlay (`pointer-events-none`) that spans `inset-0`.
- Inside that overlay, render a single `div` for the active coordinate if one exists; convert normalized coordinates using the container’s `offsetWidth`/`offsetHeight`.
- Use inline style transforms (`translate(-50%, -50%)`) so the marker remains centered even when the map scales.

## 4.2 Style the blue dot immediately
- Add a small Tailwind utility class list (e.g., `w-3 h-3 rounded-full bg-sky-500 shadow`) for the active marker so it is clearly visible without extra components.
- Optionally add a pulsing animation via Tailwind’s `animate-ping` on a nested element if you want extra pop with minimal code.
- Keep all styling inline for now—no need to create separate CSS files unless you want to tweak later.

## 4.3 Mirror the overlay in the dialog
- Reuse the same overlay block inside the expanded dialog’s `<img>` container; copy the JSX to keep things moving fast.
- Because the dialog image stretches responsively, re-run the position calculation with the dialog container’s dimensions (pull via `ref` + `getBoundingClientRect()`).
- Skip marker clustering or extra detail bubbles for now; the goal is to see the dot on both views.

## 4.4 Handle missing coordinates gently
- If the coordinate helper returns `null`, hide the marker entirely to avoid confusing users with incorrect positions.
- Optionally show a `console.warn` (already from Step 3) so you remember which photos still need coordinates while testing.
- Once the minimap renders as expected, you can double back to fine-tune sizing or add labels without touching the plumbing.

## 4.5 Keep dependencies light
- Do not introduce new libraries or components—stick to the existing React + Tailwind stack to avoid configuration overhead.
- Rely on the already-imported Tooltip/Dialog primitives only if you have spare time; they are not required for the initial blue dot.
- Circle back to richer experiences (marker lists, tooltips, discovery legends) after the quick implementation is live.
