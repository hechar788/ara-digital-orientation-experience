# Information Hotspots

Information hotspots are clickable spheres in the panoramic viewer that display contextual information to users. They use the same color as the AI chat header (#0C586E) and display an info icon.

## Features

- **Visual Design**: Teal/blue sphere (#0C586E) with a white info icon (matching AI chat header)
- **Interactive**: Clickable hotspots that open a modal popup
- **User-Friendly**: Simple popup with title, description, and close button

## Adding Information Hotspot to Photos

To add an information hotspot to a photo, include it in the `hotspots` array of your `Photo` object:

### Example

```typescript
import type { Photo } from '@/types/tour'

const myPhoto: Photo = {
  id: 'example-location',
  imageUrl: '/360_photos/example.webp',
  directions: {
    forward: {
      photoId: 'next-location',
      angle: 0
    }
  },
  hotspots: [
    {
      direction: 'information',
      position: {
        x: 5.0,   // X coordinate in 3D space
        y: 2.0,   // Y coordinate in 3D space (positive = up)
        z: 3.0    // Z coordinate in 3D space
      },
      title: 'Welcome to the Library',
      description: 'This is the main library building. It has 3 floors with study areas, computer labs, and a café on the ground floor.\n\nOpening hours:\nMonday - Friday: 8am - 10pm\nWeekend: 10am - 6pm'
    },
    // You can add multiple information hotspots
    {
      direction: 'information',
      position: {
        x: -4.0,
        y: 1.5,
        z: 2.0
      },
      title: 'Student Services',
      description: 'Student support services are available on the second floor. We can help with academic advice, counseling, and career guidance.'
    }
  ]
}
```

## Field Reference

### Required Fields

- **`direction`**: Must be set to `'information'` for information hotspots
- **`position`**: Object with `x`, `y`, `z` coordinates (in 3D space on the sphere)
- **`title`**: String - The heading displayed in the popup
- **`description`**: String - The body text displayed in the popup (supports line breaks with `\n`)

### Optional Fields

- **`destination`**: Not used for information hotspots (only for navigation hotspots)

## Positioning Tips

1. **Coordinate System**: The viewer uses a spherical coordinate system
   - `x` and `z` control horizontal position
   - `y` controls vertical position (positive = up, negative = down)
   
2. **Finding Coordinates**: 
   - Use the browser console and Three.js raycaster to find exact positions
   - Start with rough estimates and adjust based on visual placement
   - Typical y-values range from -3 (floor) to +3 (ceiling)
   - Distance from center typically around 5-8 units

3. **Multiple Hotspots**: You can add multiple information hotspots to a single photo to provide context about different features visible in that location

## Styling

The information hotspot automatically uses:
- **Sphere Color**: `#0C586E` (same as AI chat header)
- **Icon**: White "i" in a circle
- **Popup Header**: `#0C586E` background with white text
- **Size**: Same size as navigation hotspots (stairs, elevators, doors)

## User Experience

When a user clicks an information hotspot:
1. A modal popup appears centered on screen
2. The popup shows the title in the header
3. The description is displayed in the body
4. User clicks the "Close" button to dismiss
5. User can also click outside the popup to close it

