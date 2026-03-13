/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  useColorScheme,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import notifee from '@notifee/react-native';
import { requestNotifications } from 'react-native-permissions';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const setupPush = async () => {
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'default',
          name: 'Default',
          importance: 4,
        });
      }
      await requestNotifications(['alert', 'sound']);
    };
    setupPush();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [count, setCount] = useState(0);

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
          // Increment by 3 instead of 1
          setCount(current => current + 3);
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
