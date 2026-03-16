import React, {useState} from 'react';
import {SafeAreaView, Text, Button, View} from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);

  // increment step: 2
  const handleIncrement = () => {
    // use functional update to avoid stale state
    setCount(prev => prev + 2);
  };

  return (
    <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <View style={{alignItems: 'center'}}>
        <Text testID="counter">{count}</Text>
        <Button title="Increment" onPress={handleIncrement} />
      </View>
    </SafeAreaView>
  );
}
