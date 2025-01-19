import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from "./components/theme-provider"
import "./app.css"
import type { RouterContext } from './routes/__root'
import { getExplanationsQueryOptions, getExplanationQueryOptions } from './api/queries'
import { routerContext, setRouter } from './lib/routerContext'

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
    },
  },
})

let socket: WebSocket | null = null;

// Function to initialize WebSocket
const initWebSocket = () => {
  if (socket) {
    socket.close();
  }

  socket = new WebSocket('ws://localhost:8000/api/ws')

  socket.onmessage = (event) => {
    console.log('WebSocket message received:', event.data)
    try {
      const data = JSON.parse(event.data)
      
      if (data.type === 'explanation_ready') {
        // Invalidate queries to refetch data
        queryClient.invalidateQueries(getExplanationsQueryOptions())
        queryClient.invalidateQueries(getExplanationQueryOptions(data.id))
        router.invalidate()
      } else if (data.type === 'explanation_error') {
        console.error('Explanation error:', data.error)
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }

  socket.onopen = () => {
    console.log('WebSocket connection established')
  }

  socket.onclose = () => {
    console.log('WebSocket connection closed')
  }
}

// Set up a Router instance
const router = createRouter({
  routeTree,
  context: routerContext
})

setRouter(router)

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Initialize the app
const rootElement = document.getElementById('app')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  )
}
