import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '../navigation/RootNavigator';
import { PeachPulseProvider } from '../state/PeachPulseContext';

export default function App() {
  const [fontsLoaded] = useFonts({
    MoonFlower: require('../../assets/fonts/Moon Flower.ttf'),
    UrbanBlocker: require('../../assets/fonts/Urban Blocker Solid.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PeachPulseProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </PeachPulseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}