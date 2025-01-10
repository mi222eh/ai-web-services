import { CreateSynonymDTO, Explanation } from '@/types/models';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = '/api/explanations';

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
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });
  
  if (query) {
    params.append('query', query);
  }
  
  const response = await axios.get<PaginatedResponse<Explanation>>(`${API_URL}?${params}`);
  return response.data;
};

const fetchExplanationById = async (id: string): Promise<Explanation> => {
  const response = await axios.get<Explanation>(`${API_URL}/${id}`);
  return response.data;
};

const createExplanation = async (data: CreateSynonymDTO): Promise<Explanation> => {
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
  });
};

export const useExplanation = (id: string) => {
  return useQuery({
    queryKey: ['explanation', id],
    queryFn: () => fetchExplanationById(id),
    enabled: !!id,
  });
};

export const useCreateExplanation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExplanation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['explanations'] });
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
