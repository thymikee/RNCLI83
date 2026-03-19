/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { Text } from 'react-native';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

test('increment button increases counter by 5', async () => {
  let testRenderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    testRenderer = ReactTestRenderer.create(<App />);
  });

  if (!testRenderer) throw new Error('Failed to create test renderer');

  const root = testRenderer.root;

  // Find the Text node that displays the counter (initially '0')
  const counterText = root.findAllByType(Text).find(node => node.props.children === 0 || node.props.children === '0');
  expect(counterText).toBeDefined();

  // Find the Increment button's Text node and call its parent Pressable's onPress
  const incrementText = root.findAllByProps({ children: 'Increment' })[0];
  const pressable = incrementText && incrementText.parent;
  expect(pressable).toBeDefined();

  await ReactTestRenderer.act(() => {
    pressable.props.onPress();
  });

  // After one press, counter should be 5
  const updatedCounterText = root.findAllByType(Text).find(node => node.props.children === 5 || node.props.children === '5');
  expect(updatedCounterText).toBeDefined();
});
