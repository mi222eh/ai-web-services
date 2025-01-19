import type { RouterContext } from '../routes/__root'
import { queryClient } from '@/main'
import { getAuthCheckQueryOptions } from '@/api/queries'

let router: any

export const setRouter = (r: any) => {
  router = r
}

export const routerContext: RouterContext = {
  auth: {
    isAuthenticated: false,  // Start with false, root component will sync with query cache
    checkAuth: async () => {
      console.log("checkAuth called")
      try {
        // Get data from cache first if available
        console.log("Checking cache for auth data")
        const cachedData = queryClient.getQueryData(getAuthCheckQueryOptions().queryKey)
        if (cachedData) {
          console.log("Found cached auth data:", cachedData)
          routerContext.auth.isAuthenticated = cachedData.authenticated
          return cachedData.authenticated
        }

        console.log("No cached data, fetching fresh data")
        // If no cached data, fetch fresh data
        const data = await queryClient.ensureQueryData(getAuthCheckQueryOptions())
        console.log("Fresh auth data:", data)
        routerContext.auth.isAuthenticated = data.authenticated
        return data.authenticated
      } catch (error) {
        console.error("Error checking auth:", error)
        routerContext.auth.isAuthenticated = false
        return false
      }
    }
  }
} 