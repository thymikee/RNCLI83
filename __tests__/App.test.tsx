/**
 * @format
 */

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('react-native-permissions', () => ({
  requestNotifications: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@notifee/react-native', () => ({
  createChannel: jest.fn(() => Promise.resolve({})),
  AndroidImportance: {
    DEFAULT: 3,
    HIGH: 4,
    MAX: 5,
  },
}));

jest.mock('react-native-permissions', () => ({
  requestNotifications: jest.fn(() =>
    Promise.resolve({
      status: 'granted',
      settings: {},
    }),
  ),
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
