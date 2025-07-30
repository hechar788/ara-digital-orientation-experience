# Software Development Project

## Overview
This is a modern React web application built with TanStack Start, featuring file-based routing, state management, and data fetching capabilities. The project serves as a starter template with comprehensive demo examples.

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

### Testing
- **Vitest** - Testing framework
- **Testing Library** - React testing utilities
- **jsdom** - DOM testing environment

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Main navigation header
│   └── ui/             # shadcn/ui components
├── integrations/       # Third-party integrations
│   └── tanstack-query/ # React Query setup
├── lib/                # Utilities and configuration
│   ├── demo-store.ts   # TanStack Store examples
│   └── utils.ts        # Utility functions
├── routes/             # File-based routes
│   ├── __root.tsx      # Root layout component
│   ├── index.tsx       # Home page
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

### File-Based Routing
Routes are automatically generated from files in `src/routes/`. Each route file exports a component and route configuration.

### Data Fetching
- **Route Loaders**: Load data before route rendering
- **TanStack Query**: Advanced server state management with caching
- **Demo Examples**: Multiple data fetching patterns demonstrated

### State Management
- **TanStack Store**: Simple, reactive state management
- **Derived State**: Computed values that update automatically
- **Demo Store**: Counter example with derived state

### Styling System
- **Tailwind CSS**: Utility-first styling
- **Component Variants**: Using `class-variance-authority`
- **Responsive Design**: Mobile-first approach

## Demo Files
Files prefixed with `demo` can be safely deleted - they demonstrate:
- API requests and server functions
- TanStack Query usage
- Store management patterns
- Route loading strategies

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