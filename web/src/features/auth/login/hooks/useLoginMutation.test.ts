import { renderHook } from '@testing-library/react';

import { AUTH_TOKEN_KEY, APP_ROUTES } from '@/shared/constants';
import { useLoginMutation } from './useLoginMutation';

const mockReplace = jest.fn();
const mockSetAuthenticated = jest.fn();
const mockClear = jest.fn();
const mockUseMutation = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => mockUseMutation(options),
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

describe('useLoginMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockUseMutation.mockImplementation((options) => options);
  });

  it('clears cached queries and updates auth state after login success', () => {
    renderHook(() => useLoginMutation());

    const options = mockUseMutation.mock.calls[0]?.[0] as {
      onSuccess: (payload: { accessToken: string }) => void;
    };
    options.onSuccess({ accessToken: 'new-token' });

    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBe('new-token');
    expect(mockClear).toHaveBeenCalledTimes(1);
    expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
    expect(mockReplace).toHaveBeenCalledWith(APP_ROUTES.home);
  });
});
