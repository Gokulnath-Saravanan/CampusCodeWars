import { describe, it, expect } from 'vitest';
import { render, screen } from './utils/test-utils';
import App from './App';
import { type UserRole } from './contexts/AuthContext';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('shows login page for unauthenticated users', () => {
    render(<App />, {
      authContext: {
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      },
    });

    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('shows main navigation elements', () => {
    render(<App />);
    expect(screen.getByText('CampusCodeWars')).toBeInTheDocument();
  });

  it('shows dashboard button when user is authenticated', () => {
    render(<App />, {
      authContext: {
        user: {
          id: 'test-id',
          username: 'user',
          role: 'user' as UserRole,
        },
        token: 'test-token',
        isAuthenticated: true,
      },
    });
    expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('shows admin dashboard link for admin users', () => {
    render(<App />, {
      authContext: {
        user: {
          id: 'test-id',
          username: 'admin',
          role: 'admin' as UserRole,
        },
        token: 'test-token',
        isAuthenticated: true,
      },
    });
    expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument();
  });
});
