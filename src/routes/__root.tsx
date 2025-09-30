import { Outlet, HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useEffect } from 'react'

import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'
import { initializeCacheDebugging } from '../lib/cacheDebug'

import '../styles.css'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Digital Orientation Experience | ARA Institute of Canterbury',
      },
    ],
    links: [],
  }),

  component: () => {
    // Initialize cache debugging in development
    useEffect(() => {
      initializeCacheDebugging()
    }, [])

    return (
      <RootDocument>
        <Outlet />
        {/* <TanStackRouterDevtools /> */}

        {/* <TanStackQueryLayout /> */}
      </RootDocument>
    )
  },
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="overflow-hidden">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
