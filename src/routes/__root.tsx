import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Link,
} from '@tanstack/react-router'
import '../styles.css'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

/**
 * Defines the per-request router context shared across TanStack routes.
 *
 * Provides strongly typed access to request-scoped integrations such as the TanStack Query client.
 *
 * @property queryClient - Initialized QueryClient used to hydrate TanStack Query loaders and actions
 */
interface MyRouterContext {
  queryClient: QueryClient
}

/**
 * Configures the application root route with document chrome, metadata, and fallback handling.
 *
 * This configuration is consumed by the TanStack Router when instantiating the client-side router.
 *
 * @returns Route definition bound to the QueryClient-aware router context
 *
 * @example
 * ```typescript
 * const router = createRouter({ routeConfig: Route })
 * ```
 */
export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
      },
      {
        title: 'Digital Orientation Experience | ARA Institute of Canterbury',
      },
    ],
    links: [],
  }),
  notFoundComponent: () => <NotFound />,

  component: () => {
    return (
      <RootDocument>
        <Outlet />
      </RootDocument>
    )
  },
})

/**
 * Renders a structured not found page with guidance back to the homepage.
 *
 * Supplies contextual messaging alongside a clear action to recover from invalid routes.
 *
 * @returns JSX element representing the not found visual hierarchy
 *
 * @example
 * ```typescript
 * <NotFound />
 * ```
 */
function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white text-slate-900">
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="max-w-md text-base text-slate-600">
          The page you are looking for may have been moved or no longer exists. Try returning to the
          homepage to continue exploring the orientation experience.
        </p>
        <Link
          to="/"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
        >
          Return home
        </Link>
      </div>
    </main>
  )
}

/**
 * Wraps route components with the HTML document shell and shared scripts.
 *
 * Injects head metadata and router scripts while respecting the application language configuration.
 *
 * @param children - React nodes rendered by descendant routes
 * @returns JSX document structure used as the root layout
 *
 * @example
 * ```typescript
 * <RootDocument>
 *   <Outlet />
 * </RootDocument>
 * ```
 */
function RootDocument({ children }: { children: ReactNode }) {
  useEffect(() => {
    const preventBrowserZoom = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '-' || event.key === '0' || event.key === '=')) {
        event.preventDefault()
      }
    }

    const preventCtrlWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
      }
    }

    document.addEventListener('keydown', preventBrowserZoom)
    document.addEventListener('wheel', preventCtrlWheel, { passive: false })

    return () => {
      document.removeEventListener('keydown', preventBrowserZoom)
      document.removeEventListener('wheel', preventCtrlWheel)
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="overflow-hidden touch-manipulation">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
