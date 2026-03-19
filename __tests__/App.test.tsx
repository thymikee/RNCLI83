/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

test('pressing the increment button increases the count by 5', async () => {
  let renderer: any;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  const root = renderer.root;

  // Find the Pressable by role prop
  const pressable = root.findByProps({ role: 'button' });

  // Initial count should be "0"
  const textNodes = root.findAllByType(Text);
  const countNode = textNodes.find(node => node.props.style && node.props.style.fontSize === 80);
  expect(countNode.props.children).toBe(0);

  // Press the button once
  await ReactTestRenderer.act(() => {
    pressable.props.onPress();
  });

  // After one press, the count should be 5
  const updatedTextNodes = root.findAllByType(Text);
  const updatedCountNode = updatedTextNodes.find(node => node.props.style && node.props.style.fontSize === 80);
  expect(updatedCountNode.props.children).toBe(5);
});
