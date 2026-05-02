import { useState } from 'react';
import { api } from '../lib/api';
import type { AnalyticsResponse } from '../types';

export const useAnalytics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAnalytics = async (slug: string, days = 30) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<AnalyticsResponse>(
        `/analytics/${slug}`,
        {
          params: { days },
        }
      );
      return data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to fetch analytics';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getAnalytics,
    isLoading,
    error,
  };
};
