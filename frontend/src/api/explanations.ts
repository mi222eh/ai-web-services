import { CreateSynonymDTO, Explanation } from '@/types/models';
import axios from 'axios';

const API_URL = '/api/explanations';

export const fetchExplanations = async (): Promise<Explanation[]> => {
  const response = await axios.get<Explanation[]>(API_URL);
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
