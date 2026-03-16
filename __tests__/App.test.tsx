/**
 * @format
 */

jest.mock('@notifee/react-native', () => ({
  createChannel: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-permissions', () => ({
  requestNotifications: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
