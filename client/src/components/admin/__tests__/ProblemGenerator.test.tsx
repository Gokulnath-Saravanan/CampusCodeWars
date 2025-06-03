import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../utils/test-utils';
import ProblemGenerator from '../ProblemGenerator';
import { type UserRole } from '../../../contexts/AuthContext';
import api from '../../../services/api';

// Mock the API
vi.mock('../../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('ProblemGenerator Component', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders problem generator form', () => {
    render(<ProblemGenerator />, { authContext: mockAuthContext });
    expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const mockResponse = {
      data: {
        title: 'Test Problem',
        description: 'Test Description',
        difficulty: 'medium',
        tags: ['arrays'],
      },
    };

    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    render(<ProblemGenerator />, { authContext: mockAuthContext });

    fireEvent.change(screen.getByLabelText(/difficulty/i), {
      target: { value: 'medium' },
    });

    fireEvent.change(screen.getByLabelText(/tags/i), {
      target: { value: 'arrays' },
    });

    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/problems/generate', {
        difficulty: 'medium',
        tags: ['arrays'],
      });
    });
  });

  it('displays error message on API failure', async () => {
    const mockError = new Error('API Error');
    vi.mocked(api.post).mockRejectedValueOnce(mockError);

    render(<ProblemGenerator />, { authContext: mockAuthContext });

    fireEvent.change(screen.getByLabelText(/difficulty/i), {
      target: { value: 'medium' },
    });

    fireEvent.change(screen.getByLabelText(/tags/i), {
      target: { value: 'arrays' },
    });

    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('disables buttons during generation', async () => {
    vi.mocked(api.post).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<ProblemGenerator />, { authContext: mockAuthContext });

    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);

    expect(generateButton).toBeDisabled();

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });
  });
}); 