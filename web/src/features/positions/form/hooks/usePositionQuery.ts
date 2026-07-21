'use client';

import { useQuery } from '@tanstack/react-query';

import { getPosition } from '../../services';

export function usePositionQuery(id: string) {
  return useQuery({
    queryKey: ['positions', id],
    queryFn: () => getPosition(id),
  });
}
