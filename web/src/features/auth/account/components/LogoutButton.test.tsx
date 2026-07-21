import { fireEvent, render, screen } from '@testing-library/react';

import { useLogout } from '@shared/hooks';

import LogoutButton from './LogoutButton';

jest.mock('@shared/hooks', () => ({
  useLogout: jest.fn(),
}));

const mockedUseLogout = useLogout as jest.MockedFunction<typeof useLogout>;

describe('LogoutButton', () => {
  it('calls the logout flow from account settings', () => {
    const logout = jest.fn();
    mockedUseLogout.mockReturnValue(logout);

    render(<LogoutButton />);

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
