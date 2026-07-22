'use client';

import { useQuery } from '@tanstack/react-query';

import { getModel } from '../../services';

export function useModelQuery(id: string) {
  return useQuery({
    queryKey: ['models', id],
    queryFn: () => getModel(id),
  });
}
