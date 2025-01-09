import { CreateSynonymDTO, Explanation } from '@/types/models';
import axios from 'axios';

const API_URL = '/api/explanations';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export const fetchExplanations = async (
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

export const fetchExplanationById = async (id: string): Promise<Explanation> => {
  const response = await axios.get<Explanation>(`${API_URL}/${id}`);
  return response.data;
};

export const createExplanation = async (data: CreateSynonymDTO): Promise<Explanation> => {
  const response = await axios.post<Explanation>(API_URL, data);
  return response.data;
};

    export const updateExplanation = async (id: string): Promise<Explanation> => {
  const response = await axios.put<Explanation>(`${API_URL}/${id}`);
  return response.data;
};

export const deleteExplanation = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
