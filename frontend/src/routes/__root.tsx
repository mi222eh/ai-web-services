import { createRootRouteWithContext, Outlet, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useAuthCheck, useLogout } from '@/api/auth'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useEffect } from 'react'
import { routerContext } from '@/lib/routerContext'
import { queryClient } from '@/main'
import { getAuthCheckQueryOptions } from '@/api/queries'

export interface RouterContext {
  auth: {
    isAuthenticated: boolean
    checkAuth: () => Promise<boolean>
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const { data: authData, isLoading } = useAuthCheck();
  const logoutMutation = useLogout();
  const webSocket = useWebSocket();
  const navigate = useNavigate();

  console.log("RootComponent render", { authData, isLoading })

  // Sync auth state with router context
  useEffect(() => {
    const newAuthState = authData?.authenticated ?? false
    console.log("Syncing auth state:", { newAuthState, authData })
    routerContext.auth.isAuthenticated = newAuthState
  }, [authData])
  
  // Initialize WebSocket connection when authenticated
  useEffect(() => {
    console.log("WebSocket effect", { isAuthenticated: routerContext.auth.isAuthenticated })
    if (routerContext.auth.isAuthenticated) {
      webSocket.connect();
    } else {
      webSocket.disconnect();
    }
  }, [routerContext.auth.isAuthenticated, webSocket]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate({ to: '/login' })
      }
    })
  }
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {routerContext.auth.isAuthenticated && (
        <nav className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold">AI Web Services</h1>
                </div>
                <div className="ml-6 flex items-center space-x-4">
                  <Link 
                    to="/explanations"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Explanations
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
