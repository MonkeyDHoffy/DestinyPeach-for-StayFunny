import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '../navigation/RootNavigator';
import { PeachPulseProvider, usePeachPulse } from '../state/PeachPulseContext';

type BgmGlobals = typeof globalThis & {
  __destinyBootyBgm?: Audio.Sound | null;
  __destinyBootyBgmInit?: Promise<Audio.Sound | null> | null;
};

const bgmGlobal = globalThis as BgmGlobals;
const BASE_BGM_VOLUME = 0.225;
const HOLD_BGM_MULTIPLIER = 0.7;

const getBgmVolume = (isPeachPressed: boolean) =>
  isPeachPressed ? BASE_BGM_VOLUME * HOLD_BGM_MULTIPLIER : BASE_BGM_VOLUME;

const getOrCreateBackgroundMusic = async () => {
  if (bgmGlobal.__destinyBootyBgm) {
    return bgmGlobal.__destinyBootyBgm;
  }

  if (bgmGlobal.__destinyBootyBgmInit) {
    return bgmGlobal.__destinyBootyBgmInit;
  }

  bgmGlobal.__destinyBootyBgmInit = (async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/audio/bglagoon.wav'),
        {
          shouldPlay: false,
          isLooping: true,
          volume: BASE_BGM_VOLUME,
        }
      );

      if (bgmGlobal.__destinyBootyBgm) {
        await sound.unloadAsync();
        return bgmGlobal.__destinyBootyBgm;
      }

      bgmGlobal.__destinyBootyBgm = sound;
      return sound;
    } catch {
      return null;
    } finally {
      bgmGlobal.__destinyBootyBgmInit = null;
    }
  })();

  return bgmGlobal.__destinyBootyBgmInit;
};

function BackgroundMusicController() {
  const { isMusicMuted, isPeachPressed } = usePeachPulse();

  const applyMusicMuteState = async (muted: boolean, pressed: boolean) => {
    const sound = await getOrCreateBackgroundMusic();
    if (!sound) {
      return;
    }

    if (muted) {
      await sound.setVolumeAsync(0);
      await sound.pauseAsync();
      return;
    }

    await sound.setVolumeAsync(getBgmVolume(pressed));
    const status = await sound.getStatusAsync();
    if (status.isLoaded && !status.isPlaying) {
      await sound.playAsync();
    }
  };

  useEffect(() => {
    void applyMusicMuteState(isMusicMuted, isPeachPressed);
  }, []);

  useEffect(() => {
    void applyMusicMuteState(isMusicMuted, isPeachPressed);
  }, [isMusicMuted, isPeachPressed]);

  return null;
}

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
          <BackgroundMusicController />
          <StatusBar style="light" />
          <RootNavigator />
        </PeachPulseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}