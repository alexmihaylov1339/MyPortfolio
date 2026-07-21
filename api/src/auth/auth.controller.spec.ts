import { AuthController } from './auth.controller';
import { AUTH_ERROR_MESSAGES } from './auth-errors';

interface AuthServiceMock {
  register: jest.Mock;
  login: jest.Mock;
  devLogin: jest.Mock;
  forgotPassword: jest.Mock;
  resetPassword: jest.Mock;
  getMe: jest.Mock;
  updateAccount: jest.Mock;
}

function createAuthServiceMock(): AuthServiceMock {
  return {
    register: jest.fn(),
    login: jest.fn(),
    devLogin: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    getMe: jest.fn(),
    updateAccount: jest.fn(),
  };
}

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthServiceMock;

  beforeEach(() => {
    authService = createAuthServiceMock();
    controller = new AuthController(authService as never);
  });

  it('validates login input before calling the service', () => {
    expect(() =>
      controller.login({ email: '   ', password: 'secret123' }),
    ).toThrow(AUTH_ERROR_MESSAGES.emailRequired);

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('normalizes register input before calling the service', async () => {
    authService.register.mockResolvedValue({
      accessToken: 'token-1',
      user: {
        id: 'user-1',
        email: 'test@example.com',
      },
    });

    await expect(
      controller.register({
        email: ' Test@example.com ',
        password: 'secret123',
        name: ' Portfolio User ',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        accessToken: 'token-1',
      }),
    );

    expect(authService.register).toHaveBeenCalledWith({
      email: 'Test@example.com',
      password: 'secret123',
      name: 'Portfolio User',
    });
  });

  it('normalizes updateAccount input before calling the service', async () => {
    authService.updateAccount.mockResolvedValue({
      id: 'user-1',
      email: 'updated@example.com',
      name: 'Updated User',
    });

    await expect(
      controller.updateAccount(
        { id: 'user-1', email: 'user@example.com' },
        { email: ' updated@example.com ', name: ' Updated User ' },
      ),
    ).resolves.toEqual({
      user: {
        id: 'user-1',
        email: 'updated@example.com',
        name: 'Updated User',
      },
    });

    expect(authService.updateAccount).toHaveBeenCalledWith('user-1', {
      email: 'updated@example.com',
      name: 'Updated User',
    });
  });
});
