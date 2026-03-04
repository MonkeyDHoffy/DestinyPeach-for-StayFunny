import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

type PeachPulseContextValue = {
  motion: Animated.Value;
  setPeachPressed: (pressed: boolean) => void;
};

const PeachPulseContext = createContext<PeachPulseContextValue | undefined>(undefined);

type PeachPulseProviderProps = {
  children: ReactNode;
};

export function PeachPulseProvider({ children }: PeachPulseProviderProps) {
  const motion = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [isPressed, setIsPressed] = useState(false);

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
      setPeachPressed: setIsPressed,
    }),
    [motion]
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
