/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useState } from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  useColorScheme,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [count, setCount] = useState(0);

  const fillArray = () => {
    const chunks: Uint8Array[] = [];
    while (true) {
      chunks.push(new Uint8Array(50 * 1024 * 1024)); // 50MB each
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Agent Device Tester</Text>
      <Text style={styles.descriptionText}>
        This is a tester for the Agent Device app.
      </Text>
      <Text style={styles.countText}>{count}</Text>
      <Pressable
        role="button"
        style={styles.button}
        onPress={() => {
          setCount(count + 67);
          fillArray();
        }}
      >
        <Text style={styles.buttonText}>Increment</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    justifyContent: 'center',
  },
  countText: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 60,
  },
  buttonText: {
    fontSize: 20,
  },
  button: {
    backgroundColor: 'violet',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  titleText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default App;
