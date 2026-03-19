/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

test('pressing increment increases count by 5', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  const root = renderer!.root;
  const countText = root.findByProps({ testID: 'count' });
  const button = root.findByProps({ testID: 'increment-button' });

  expect(countText.props.children).toBe(0);

  await ReactTestRenderer.act(() => {
    // Trigger the onPress handler
    button.props.onPress();
  });

  // After one press the count should be 5
  expect(countText.props.children).toBe(5);
});
