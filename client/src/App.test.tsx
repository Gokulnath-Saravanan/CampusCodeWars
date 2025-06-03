import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main navigation elements', () => {
  render(<App />);
  expect(screen.getByText('CampusCodeWars')).toBeInTheDocument();
  expect(screen.getByText('Login')).toBeInTheDocument();
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText('Problems')).toBeInTheDocument();
  expect(screen.getByText('Contests')).toBeInTheDocument();
  expect(screen.getByText('Leaderboard')).toBeInTheDocument();
});
