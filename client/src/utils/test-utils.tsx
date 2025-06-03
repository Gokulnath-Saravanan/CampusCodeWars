import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';
import { ReactNode } from 'react';
import { vi } from 'vitest';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authContext?: Partial<AuthContextType>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  loading: false,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
};

export function render(
  ui: ReactNode,
  { authContext = {}, ...renderOptions }: CustomRenderOptions = {}
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <BrowserRouter>
      <AuthContext.Provider value={{ ...defaultAuthContext, ...authContext }}>
        {children}
      </AuthContext.Provider>
    </BrowserRouter>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react'; 