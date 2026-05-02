import { useState } from 'react';
import { api } from '../lib/api';
import type { LinkResponse, CreateLinkPayload } from '../types';

export const useLinks = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLinks = async (skip = 0, limit = 100) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<LinkResponse[]>('/links', {
        params: { skip, limit },
      });
      return data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to fetch links';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createLink = async (payload: CreateLinkPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post<LinkResponse>('/links', payload);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to create link';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLink = async (slug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/links/${slug}`);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to delete link';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getLinks,
    createLink,
    deleteLink,
    isLoading,
    error,
  };
};
