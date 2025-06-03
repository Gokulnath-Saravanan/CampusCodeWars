import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main navigation elements', () => {
  render(<App />);
  expect(screen.getByText('CampusCodeWars')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Problems' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Contests' })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Leaderboard' })
  ).toBeInTheDocument();
});
