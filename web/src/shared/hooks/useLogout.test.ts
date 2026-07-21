import { act, renderHook } from '@testing-library/react';

import { AUTH_TOKEN_KEY } from '@/shared/constants';
import { useLogout } from './useLogout';

const mockReplace = jest.fn();
const mockSetAuthenticated = jest.fn();
const mockClear = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    clear: mockClear,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@/shared/components/AuthProvider', () => ({
  useAuth: () => ({
    setAuthenticated: mockSetAuthenticated,
  }),
}));

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it('clears auth state, query cache, and redirects to login', () => {
    window.localStorage.setItem(AUTH_TOKEN_KEY, 'old-token');

    const { result } = renderHook(() => useLogout());

    act(() => {
      result.current();
    });

    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(mockClear).toHaveBeenCalledTimes(1);
    expect(mockSetAuthenticated).toHaveBeenCalledWith(false);
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
