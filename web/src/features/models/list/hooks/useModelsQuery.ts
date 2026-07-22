'use client';

import { useQuery } from '@tanstack/react-query';

import { listModels } from '../../services';

export function useModelsQuery() {
  return useQuery({
    queryKey: ['models'],
    queryFn: listModels,
  });
}
