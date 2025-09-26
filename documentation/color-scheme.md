# Color Scheme Documentation

## Overview

This project uses a comprehensive color system built on **Tailwind CSS** with custom CSS variables and the **shadcn/ui** component library. The color palette is based on the **Zinc** base color and supports both light and dark themes using OKLCH color space for better color accuracy.

## Color System Architecture

### CSS Variable System

The project uses CSS custom properties (variables) defined in `src/styles.css` that automatically switch between light and dark themes:

#### Light Theme (`:root`)
```css
--background: oklch(1 0 0)              /* Pure white */
--foreground: oklch(0.141 0.005 285.823) /* Dark gray-black */
--primary: oklch(0.21 0.006 285.885)    /* Dark zinc */
--secondary: oklch(0.967 0.001 286.375) /* Light zinc */
--muted: oklch(0.967 0.001 286.375)     /* Light zinc */
--accent: oklch(0.967 0.001 286.375)    /* Light zinc */
--destructive: oklch(0.577 0.245 27.325) /* Red */
--border: oklch(0.92 0.004 286.32)      /* Light gray border */
--ring: oklch(0.871 0.006 286.286)      /* Focus ring */
```

#### Dark Theme (`.dark`)
```css
--background: oklch(0.141 0.005 285.823) /* Dark gray-black */
--foreground: oklch(0.985 0 0)           /* Near white */
--primary: oklch(0.985 0 0)              /* White */
--secondary: oklch(0.274 0.006 286.033)  /* Medium gray */
--muted: oklch(0.274 0.006 286.033)      /* Medium gray */
--accent: oklch(0.274 0.006 286.033)     /* Medium gray */
--destructive: oklch(0.396 0.141 25.723) /* Dark red */
--border: oklch(0.274 0.006 286.033)     /* Dark border */
--ring: oklch(0.442 0.017 285.786)       /* Dark focus ring */
```

## Component-Specific Colors

### Custom Application Colors

#### Blue Gradient (AI Chat/Primary Actions)
- **Blue 500**: `from-blue-500` - Used in gradients for AI chat avatars and buttons
- **Blue 400**: `hover:text-blue-400` - Hover state for blue elements
- **Purple 600**: `to-purple-600` - Gradient endpoint for AI-related elements

#### Gray Scale System
- **Gray 900**: `bg-gray-900` - Main background (routes/index.tsx)
- **Gray 800**: `bg-gray-800/90` - Control backgrounds with opacity
- **Gray 700**: `hover:bg-gray-700/90` - Hover states for controls
- **Gray 600**: `text-gray-600`, `border-gray-600/50` - Secondary text and borders
- **Gray 500**: `text-gray-500` - Muted text
- **Gray 400**: `text-gray-400` - Placeholder/inactive elements
- **Gray 300**: `border-gray-300` - Input borders
- **Gray 200**: `bg-gray-200`, `border-gray-200` - Light backgrounds and borders
- **Gray 100**: `hover:bg-gray-100` - Light hover states
- **Gray 50**: `bg-gray-50` - Very light backgrounds

#### Status Colors
- **Red 400**: `text-red-400` - Error messages
- **Red 600**: `bg-red-600/90` - VR mode active state
- **Red 500**: `hover:bg-red-500/90` - VR mode hover
- **White**: `text-white`, `bg-white` - Text on dark backgrounds, pure white backgrounds

## Semantic Color Tokens

### shadcn/ui Design System

The project uses semantic color tokens that automatically adapt to light/dark themes:

#### Primary Colors
- `background` - Main page background
- `foreground` - Primary text color
- `primary` / `primary-foreground` - Primary buttons and actions
- `secondary` / `secondary-foreground` - Secondary elements
- `muted` / `muted-foreground` - Subdued content
- `accent` / `accent-foreground` - Accent elements
- `destructive` / `destructive-foreground` - Error/danger states

#### UI Element Colors
- `card` / `card-foreground` - Card containers
- `popover` / `popover-foreground` - Floating elements
- `border` - Element borders
- `input` - Form input backgrounds
- `ring` - Focus indicators

#### Sidebar Colors
- `sidebar` / `sidebar-foreground` - Sidebar backgrounds and text
- `sidebar-primary` / `sidebar-primary-foreground` - Primary sidebar elements
- `sidebar-accent` / `sidebar-accent-foreground` - Accent sidebar elements
- `sidebar-border` - Sidebar borders
- `sidebar-ring` - Sidebar focus states

#### Chart Colors
- `chart-1` through `chart-5` - Data visualization colors

## Color Usage Patterns

### Gradients
```css
/* AI Chat Avatar Gradient */
bg-gradient-to-r from-blue-500 to-purple-600

/* AI Chat Background Gradient */
bg-gradient-to-r from-blue-500/5 to-purple-600/5
```

### Interactive States
```css
/* Button States */
bg-gray-800/90 hover:bg-gray-700/90

/* VR Mode Toggle */
bg-red-600/90 hover:bg-red-500/90  /* Active */
bg-gray-800/90 hover:bg-gray-700/90 /* Inactive */

/* Text Hover States */
text-gray-500 hover:text-gray-800
text-blue-500 hover:text-blue-400
```

### Transparency Usage
- `/90` - Semi-transparent backgrounds (90% opacity)
- `/50` - Medium transparency for borders and overlays
- `/5` - Very light transparency for subtle backgrounds
- `/20`, `/30`, `/40` - Various transparency levels for different UI states

## Component Color Mapping

### PanoramicViewer Component
- Background: `bg-gray-900`
- Loading text: `text-white`
- Error text: `text-red-400`
- Icon color: `text-gray-400`

### PanoramicViewerControls
- Control bar: `bg-gray-800/90` with `backdrop-blur-sm`
- Text info: `bg-gray-800/90`, `text-gray-200`
- Button backgrounds: `bg-gray-800/90 hover:bg-gray-700/90`
- Button text: `text-white`
- Borders: `border-gray-600/50`
- VR active state: `bg-red-600/90 hover:bg-red-500/90`

### AIChatPopup
- User avatar: `bg-gray-200`, `text-gray-700`
- AI avatar: `bg-gradient-to-r from-blue-500 to-purple-600`, `text-white`
- Message text: `text-gray-800`
- Input: `bg-white`, `border-gray-300`, `text-gray-800`, `placeholder-gray-500`
- Focus states: `focus:ring-blue-500/50`, `focus:border-blue-500`
- Button colors: `text-blue-500 hover:text-blue-400`


## Theme Configuration

### shadcn/ui Configuration
```json
{
  "style": "new-york",
  "tailwind": {
    "baseColor": "zinc",
    "cssVariables": true
  }
}
```

### Dark Mode Support
The project supports automatic dark mode switching using the `.dark` class selector. All semantic tokens automatically switch between light and dark variants.

## Best Practices

1. **Use Semantic Tokens**: Prefer `bg-background` over `bg-white` for automatic theme support
2. **Consistent Transparency**: Use standard opacity values (`/5`, `/20`, `/50`, `/90`)
3. **Interactive States**: Always provide hover states for interactive elements
4. **Accessibility**: Maintain proper contrast ratios between text and backgrounds
5. **Component Consistency**: Use the established gray scale for similar UI patterns

## File Locations

- **Main CSS**: `src/styles.css` - Contains all CSS variables and base styles
- **Component Config**: `components.json` - shadcn/ui configuration
- **Components**: `src/components/` - Individual component implementations with color usage