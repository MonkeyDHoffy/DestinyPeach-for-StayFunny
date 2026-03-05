import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppMode = 'destiny' | 'decision' | 'duell' | 'bounce';
export type SoundProfile = 'classic' | 'crazy';

const MUSIC_MUTED_STORAGE_KEY = 'destinyBooty.isMusicMuted';
const SFX_MUTED_STORAGE_KEY = 'destinyBooty.isSfxMuted';

type PeachPulseContextValue = {
  motion: Animated.Value;
  isPeachPressed: boolean;
  setPeachPressed: (pressed: boolean) => void;
  jellyLevel: number;
  setJellyLevel: (level: number) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  soundProfile: SoundProfile;
  setSoundProfile: (profile: SoundProfile) => void;
  isMusicMuted: boolean;
  setIsMusicMuted: (muted: boolean) => void;
  isSfxMuted: boolean;
  setIsSfxMuted: (muted: boolean) => void;
};

const PeachPulseContext = createContext<PeachPulseContextValue | undefined>(undefined);

type PeachPulseProviderProps = {
  children: ReactNode;
};

export function PeachPulseProvider({ children }: PeachPulseProviderProps) {
  const motion = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [jellyLevel, setJellyLevel] = useState(3);
  const [appMode, setAppMode] = useState<AppMode>('destiny');
  const [soundProfile, setSoundProfile] = useState<SoundProfile>('classic');
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const muteSettingsHydratedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateMuteSettings = async () => {
      try {
        const [storedMusicMuted, storedSfxMuted] = await Promise.all([
          AsyncStorage.getItem(MUSIC_MUTED_STORAGE_KEY),
          AsyncStorage.getItem(SFX_MUTED_STORAGE_KEY),
        ]);

        if (!isMounted) {
          return;
        }

        if (storedMusicMuted !== null) {
          setIsMusicMuted(storedMusicMuted === 'true');
        }

        if (storedSfxMuted !== null) {
          setIsSfxMuted(storedSfxMuted === 'true');
        }
      } catch {
      } finally {
        if (isMounted) {
          muteSettingsHydratedRef.current = true;
        }
      }
    };

    void hydrateMuteSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!muteSettingsHydratedRef.current) {
      return;
    }

    AsyncStorage.setItem(MUSIC_MUTED_STORAGE_KEY, String(isMusicMuted)).catch(() => {});
  }, [isMusicMuted]);

  useEffect(() => {
    if (!muteSettingsHydratedRef.current) {
      return;
    }

    AsyncStorage.setItem(SFX_MUTED_STORAGE_KEY, String(isSfxMuted)).catch(() => {});
  }, [isSfxMuted]);

  useEffect(() => {
    if (isPressed) {
      if (!loopRef.current) {
        loopRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(motion, {
              toValue: 1,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(motion, {
              toValue: 0,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
      }

      loopRef.current.start();
      return;
    }

    if (loopRef.current) {
      loopRef.current.stop();
      loopRef.current = null;
    }

    Animated.timing(motion, {
      toValue: 0,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isPressed, motion]);

  const value = useMemo(
    () => ({
      motion,
      isPeachPressed: isPressed,
      setPeachPressed: setIsPressed,
      jellyLevel,
      setJellyLevel,
      appMode,
      setAppMode,
      soundProfile,
      setSoundProfile,
      isMusicMuted,
      setIsMusicMuted,
      isSfxMuted,
      setIsSfxMuted,
    }),
    [motion, isPressed, jellyLevel, appMode, soundProfile, isMusicMuted, isSfxMuted]
  );

  return <PeachPulseContext.Provider value={value}>{children}</PeachPulseContext.Provider>;
}

export function usePeachPulse() {
  const context = useContext(PeachPulseContext);

  if (!context) {
    throw new Error('usePeachPulse must be used within PeachPulseProvider');
  }

  return context;
}
