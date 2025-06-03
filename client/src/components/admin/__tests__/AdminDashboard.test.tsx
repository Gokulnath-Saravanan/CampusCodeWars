import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../utils/test-utils';
import AdminDashboard from '../AdminDashboard';
import { type UserRole } from '../../../contexts/AuthContext';

describe('AdminDashboard', () => {
  const mockAuthContext = {
    user: {
      id: 'test-id',
      username: 'admin',
      role: 'admin' as UserRole,
    },
    token: 'test-token',
    loading: false,
    isAuthenticated: true,
  };

  it('renders admin dashboard', () => {
    render(<AdminDashboard />, { authContext: mockAuthContext });
    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
  });

  it('shows admin features', () => {
    render(<AdminDashboard />, { authContext: mockAuthContext });
    expect(screen.getByText(/manage users/i)).toBeInTheDocument();
    expect(screen.getByText(/manage problems/i)).toBeInTheDocument();
    expect(screen.getByText(/manage contests/i)).toBeInTheDocument();
  });
}); 