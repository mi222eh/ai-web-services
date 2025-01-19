import { CreateSynonymDTO, Explanation } from '@/types/models';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { routerContext } from '@/lib/routerContext';

const API_URL = '/api/explanations';

// Configure axios defaults
axios.defaults.withCredentials = true;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

// API functions
const fetchExplanations = async (
  skip: number = 0,
  limit: number = 10,
  query?: string
): Promise<PaginatedResponse<Explanation>> => {
  try {
    console.log('fetchExplanations', skip, limit, query)
    const response = await axios.get<PaginatedResponse<Explanation>>(`${API_URL}`,{
      params: {
        skip,
        limit,
        query
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching explanations:', error);
    return { items: [], total: 0, skip: 0, limit: 10 };
  }
};

const fetchExplanationById = async (id: string): Promise<Explanation> => {
  const response = await axios.get<Explanation>(`${API_URL}/${id}`);
  return response.data;
};

export const createExplanation = async (data: { word: string }): Promise<Explanation> => {
  const response = await axios.post<Explanation>(API_URL, data);
  return response.data;
};

const updateExplanation = async (id: string): Promise<Explanation> => {
  const response = await axios.put<Explanation>(`${API_URL}/${id}`);
  return response.data;
};

const deleteExplanation = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

// React Query Hooks
export const useExplanations = (skip: number, limit: number, query?: string) => {
  return useQuery({
    queryKey: ['explanations', skip, limit, query],
    queryFn: () => fetchExplanations(skip, limit, query),
    enabled: routerContext.auth.isAuthenticated,
  });
};

export const useExplanation = (id: string) => {
  return useQuery({
    queryKey: ['explanation', id],
    queryFn: () => fetchExplanationById(id),
    enabled: !!id && routerContext.auth.isAuthenticated,
  });
};

export const useCreateExplanation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { word: string }) => createExplanation(data),
    onSuccess: () => {
      toast.success('Förklaringen har skapats!');
      queryClient.invalidateQueries({ queryKey: ['explanations'] });
    },
    onError: (error: any) => {
      toast.error('Misslyckades med att skapa förklaring.');
      console.error('Error creating explanation:', error);
    },
  });
};

export const useUpdateExplanation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateExplanation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['explanations'] });
      queryClient.invalidateQueries({ queryKey: ['explanation', data._id] });
    },
  });
};

export const useDeleteExplanation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExplanation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['explanations'] });
    },
  });
};
