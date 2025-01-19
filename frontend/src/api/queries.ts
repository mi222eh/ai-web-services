import { queryOptions } from '@tanstack/react-query'
import axios from 'axios'

interface AuthCheckResponse {
  authenticated: boolean
}

// 5 minutes in milliseconds
const FIVE_MINUTES = 5 * 60 * 1000;

export const getAuthCheckQueryOptions = () => {
  return queryOptions({
    queryKey: ['auth', 'check'],
    queryFn: async () => {
      const { data } = await axios.get<AuthCheckResponse>('/api/auth/check')
      return data
    },
    staleTime: FIVE_MINUTES,  // Data will be considered fresh for 5 minutes
    refetchOnMount: false,    // Don't refetch when mounting components
    refetchOnWindowFocus: false  // Don't refetch when window regains focus
  })
}

export const getExplanationsQueryOptions = () => {
  return queryOptions({
    queryKey: ['explanations', 'list'] as const,
    queryFn: async () => {
      const { data } = await axios.get('/api/explanations', {
        withCredentials: true
      })
      return data
    }
  })
}

export const getExplanationQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ['explanations', 'detail', id] as const,
    queryFn: async () => {
      const { data } = await axios.get(`/api/explanations/${id}`, {
        withCredentials: true
      })
      return data
    }
  })
} 
