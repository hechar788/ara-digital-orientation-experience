# Software Development Project

A modern React web application built with TanStack Start, featuring file-based routing, state management, and comprehensive demo examples.

## 🚀 Tech Stack

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

## 📁 Project Structure

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

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run serve

# Start production server
npm start
```

## 🧪 Testing

This project uses [Vitest](https://vitest.dev/) for testing:

```bash
npm run test
```

## 🎨 Styling & Components

### Tailwind CSS
This project uses [Tailwind CSS](https://tailwindcss.com/) for styling with a utility-first approach.

### shadcn/ui Components
Add pre-built components using [shadcn/ui](https://ui.shadcn.com/):

```bash
pnpx shadcn@latest add button
```

## 🛣️ Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are automatically generated from files in `src/routes/`.

### Adding a New Route

1. Create a new file in `./src/routes/` directory
2. TanStack Router will automatically generate the route configuration
3. Use the `Link` component for navigation:

```tsx
import { Link } from "@tanstack/react-router";

<Link to="/about">About</Link>
```

### Layout System

The root layout is located in `src/routes/__root.tsx`. Content appears where you use the `<Outlet />` component.

## 📊 Data Fetching

### Route Loaders
Load data before route rendering:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/people",
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json();
  },
  component: () => {
    const data = peopleRoute.useLoaderData();
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    );
  },
});
```

### TanStack Query
Advanced server state management with caching and background updates. The project includes React Query setup in `src/integrations/tanstack-query/`.

## 🏪 State Management

### TanStack Store
Lightweight state management with reactive updates:

```tsx
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";

const countStore = new Store(0);

function Counter() {
  const count = useStore(countStore);
  return (
    <button onClick={() => countStore.setState((n) => n + 1)}>
      Count: {count}
    </button>
  );
}
```

### Derived State
Create computed values that update automatically:

```tsx
const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
});
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run serve` | Preview production build |
| `npm run test` | Run test suite |
| `npm start` | Start production server |

## 🎯 Key Features

- **File-Based Routing**: Automatic route generation
- **Type Safety**: Full TypeScript support with strict configuration
- **Server Functions**: Built-in API routes with TanStack Start
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance**: Code splitting and optimized builds
- **Developer Experience**: Hot reload, TypeScript, and comprehensive tooling

## 🧹 Demo Files

Files prefixed with `demo` demonstrate various features and can be safely deleted:
- API requests and server functions
- TanStack Query usage patterns
- Store management examples
- Route loading strategies

## 📚 Learn More

- [TanStack Start Documentation](https://tanstack.com/start)
- [TanStack Router Documentation](https://tanstack.com/router)
- [TanStack Query Documentation](https://tanstack.com/query)
- [TanStack Store Documentation](https://tanstack.com/store)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
