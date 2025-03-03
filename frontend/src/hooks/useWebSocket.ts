import { useEffect, useRef, useCallback } from 'react';
import { useAuthCheck } from '@/api/auth';
import { queryClient } from '@/main';
import { getExplanationsQueryOptions, getExplanationQueryOptions } from '@/api/queries';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';

export function useWebSocket() {
  const { data: authData } = useAuthCheck();
  const router = useRouter();
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const maxReconnectDelay = 5000; // Maximum reconnect delay in ms
  const socketRef = useRef<WebSocket | null>(null);
  
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;
    
    // Use relative path and auto-detect protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    console.log('Connecting to WebSocket:', wsUrl);
    
    // Create WebSocket with credentials
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onmessage = async (event) => {
      console.log('WebSocket message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'explanation_ready') {
          // Invalidate queries to refetch data
          await queryClient.refetchQueries(getExplanationsQueryOptions());
          await queryClient.refetchQueries(getExplanationQueryOptions(data.id));
          await queryClient.refetchQueries({
            predicate: (query) => query.queryKey[0] === 'explanations',
          });
          await router.invalidate();
        } else if (data.type === 'explanation_error') {
          console.error('Explanation error:', data.error);
          toast.error('Error generating explanation');
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    socketRef.current.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      
      // Don't reconnect if it was an auth error
      if (event.code === 1008) {
        console.error('WebSocket authentication failed');
        return;
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [router]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, disconnect };
} 