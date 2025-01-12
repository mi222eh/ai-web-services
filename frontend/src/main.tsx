import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from "./components/theme-provider"
import "./app.css"

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Create a client
const queryClient = new QueryClient()

// Set up WebSocket connection
const socket = new WebSocket('ws://localhost:8000/api/ws')

socket.onmessage = (event) => {
  console.log('WebSocket message received:', event.data)
  try {
    const data = JSON.parse(event.data)
    
    if (data.type === 'explanation_ready') {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['explanations'] })
      queryClient.invalidateQueries({ queryKey: ['explanation', data.id] })
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

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  )
}
