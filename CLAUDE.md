# VR Campus Tour with AI Assistant

## Overview
This is a modern React web application built with TanStack Start that provides an immersive 360° VR campus tour experience. The application features panoramic navigation, interactive campus exploration, and an integrated AI assistant powered by Microsoft Copilot Studio for intelligent location guidance.

## Tech Stack

### Core Framework
- **React 19.0** - Main UI framework
- **TanStack Start** - Full-stack React framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and development server

### Routing & State Management
- **TanStack Router** - File-based routing with type-safe navigation
- **TanStack Store** - Lightweight state management
- **TanStack Query** - Server state management and data fetching

### Styling & UI
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible components
- **Lucide React** - Icon library
- **shadcn/ui** - Component library built on Radix UI

### VR & 3D
- **Three.js** - 3D graphics and WebGL rendering
- **Panoramic Viewer** - 360° image navigation
- **Interactive Controls** - Camera movement and zoom

### AI Integration
- **Microsoft Copilot Studio** - AI assistant platform
- **REST API Integration** - Real-time VR navigation control
- **Chat Widget** - Embedded conversational interface

### Testing
- **Vitest** - Testing framework
- **Testing Library** - React testing utilities
- **jsdom** - DOM testing environment

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Main navigation header
│   ├── PanoramicViewer.tsx  # 360° VR tour viewer
│   └── ui/             # shadcn/ui components
├── integrations/       # Third-party integrations
│   └── tanstack-query/ # React Query setup
├── lib/                # Utilities and configuration
│   ├── demo-store.ts   # TanStack Store examples
│   └── utils.ts        # Utility functions
├── routes/             # File-based routes & API endpoints
│   ├── __root.tsx      # Root layout component
│   ├── index.tsx       # VR tour home page
│   ├── api/            # API routes for AI integration
│   │   └── vr/         # VR navigation endpoints
│   │       ├── navigate.tsx     # POST /api/vr/navigate
│   │       ├── locations.tsx    # GET /api/vr/locations
│   │       └── current-location.tsx  # GET /api/vr/current-location
│   └── demo.*          # Demo route examples
├── router.tsx          # Router configuration
├── routeTree.gen.ts    # Generated route tree
└── styles.css          # Global styles
```

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm run test` - Run test suite
- `npm start` - Start production server

## Development Commands

### Adding Components
```bash
pnpx shadcn@latest add button
```

### Running Tests
```bash
npm run test
```

### Type Checking
The project uses strict TypeScript configuration with:
- Strict mode enabled
- No unused locals/parameters
- No fallthrough cases in switch statements
- Path aliases configured (`@/*` → `./src/*`)

## Key Features

### VR Campus Tour
- **360° Panoramic Navigation**: Immersive exploration of campus locations
- **Interactive Controls**: Mouse/touch camera movement with zoom functionality
- **Location-Based Routing**: Navigate between different campus areas and buildings
- **High-Quality Imagery**: Professional 360° photography for realistic experience

### AI-Powered Assistant
- **Natural Language Navigation**: Ask "take me to the library" or "show me room X208"
- **Real-Time VR Control**: Assistant directly controls camera movement via API
- **Campus Information**: Answers questions about policies, services, and facilities
- **Contextual Help**: VR interface guidance and troubleshooting support

### Technical Architecture
- **File-Based Routing**: Routes automatically generated from `src/routes/` directory
- **API Integration**: RESTful endpoints for AI assistant communication
- **State Management**: TanStack Store for tour navigation and camera state
- **Responsive Design**: Optimized for desktop and mobile VR experiences

## AI Assistant Integration

### API Endpoints
The application provides REST API endpoints for Microsoft Copilot Studio integration:

#### Navigation Control
```http
POST /api/vr/navigate
Content-Type: application/json

{
  "locationId": "library-main-entrance",
  "transitionType": "smooth"
}
```

Response:
```json
{
  "status": "success",
  "currentLocation": "library-main-entrance",
  "message": "Navigation completed",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### Available Locations
```http
GET /api/vr/locations
```

Returns list of all navigable campus locations with metadata.

#### Current Position
```http
GET /api/vr/current-location
```

Returns user's current position in the VR tour.

### Copilot Studio Setup
1. **Knowledge Sources**: Upload campus location directory and VR help documentation
2. **Navigation Topic**: Configure location navigation with API flow integration
3. **Agent Flow**: HTTP POST requests to `/api/vr/navigate` endpoint
4. **Chat Widget**: Embed in VR application for seamless user interaction

### Deployment
- **Vercel Compatible**: API routes automatically deploy as serverless functions
- **Production Ready**: CORS and error handling configured for live deployment
- **Scalable**: Stateless design supports multiple concurrent users

## Configuration Files

- `vite.config.ts` - Vite configuration with TanStack Start plugin
- `tsconfig.json` - TypeScript configuration with strict settings
- `components.json` - shadcn/ui component configuration
- `package.json` - Dependencies and scripts

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000

4. Navigate the VR tour using:
   - **Mouse/Touch**: Drag to look around, scroll to zoom
   - **AI Assistant**: Ask "take me to [location]" for instant navigation
   - **Interactive UI**: Use on-screen controls for manual navigation

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

## Testing Strategy
- Component testing with React Testing Library
- Unit tests with Vitest
- DOM testing with jsdom
- Type checking with TypeScript compiler

## Performance Considerations
- Code splitting through route-based chunks
- React Query for efficient data caching
- Tailwind CSS for optimized styling
- Vite for fast development and builds

## Code Documentation Standards

**IMPORTANT**: All code written for this project must follow strict documentation standards for maintainability and readability.

### Required Documentation Style

**For Functions, Classes, Interfaces, Types, and ALL code constructs:**

```typescript
/**
 * Brief description of what this function/interface/class does
 *
 * More detailed explanation if needed, including context about when to use it
 * and how it fits into the larger system.
 *
 * @param paramName - Description of parameter and expected values
 * @param optionalParam - Description of optional parameter (if applicable)
 * @returns Description of return value and type
 *
 * @example
 * ```typescript
 * const result = myFunction('example', true)
 * // Returns: expected output
 * ```
 */
export function myFunction(paramName: string, optionalParam?: boolean): ReturnType {
  // Clean implementation without inline comments
}
```

**For Interfaces:**

```typescript
/**
 * Brief description of what this interface represents
 *
 * Detailed explanation of the interface's purpose and usage context.
 *
 * @property propName - Description of property and expected values
 * @property optionalProp - Description of optional property
 * @property nestedObject - Description of nested object structure
 * @property nestedObject.subProp - Description of nested properties when complex
 */
export interface MyInterface {
  propName: string
  optionalProp?: number
  nestedObject: {
    subProp: boolean
  }
}
```

### Documentation Requirements

1. **Every export** must have JSDoc documentation
2. **No inline comments** cluttering the code structure
3. **Examples required** for complex functions and usage patterns
4. **Parameter descriptions** must include expected value types/ranges
5. **Return value documentation** must describe both type and meaning
6. **Interface properties** documented with `@property` tags in JSDoc block
7. **Clean separation** between documentation and implementation

### Rationale

This documentation standard ensures:
- **Maintainability**: Future developers can understand code purpose immediately
- **IDE Support**: Proper IntelliSense and hover documentation
- **Team Collaboration**: Clear communication of intent and usage
- **Code Quality**: Forces consideration of function/interface design
- **Scalability**: Documentation scales with codebase complexity

**This standard applies to ALL code written for this project - no exceptions.**