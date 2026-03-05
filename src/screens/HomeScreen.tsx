import { useEffect, useMemo, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import {
  decisionSayings,
  destinySayings,
  duellPlaceholderSayings,
} from '../data/sayingsByMode';
import { holdSoundsByProfile, releaseSoundsByProfile } from '../data/soundByProfile';
import { usePeachPulse } from '../state/PeachPulseContext';
import { colors } from '../theme/colors';

const peachImage = require('../../assets/pics/finalpeach.png');
const PEACH_Y_OFFSET = 28;
const MIN_PRESS_MS = 150;
const BUBBLE_COLORS = [
  '#47DDFA',
  '#47fae9',
  '#33f3e0',
  '#3ed7f5',
  '#13f5cb',
  '#71f2ff',
  '#a1e7ef',
  '#8cffdf',
];
const RELEASE_PARTICLE_COLORS = [colors.surface, '#FFFFFF', colors.peachLight];

type BubbleRadii = {
  borderTopLeftRadius: number;
  borderTopRightRadius: number;
  borderBottomLeftRadius: number;
  borderBottomRightRadius: number;
};

type HoldWiggleProfile = {
  drift: number;
  tilt: number;
  bounce: number;
  squash: number;
  durationA: number;
  durationB: number;
};

type ReleaseParticle = {
  id: number;
  originX: number;
  originY: number;
  size: number;
  color: string;
  translateX: Animated.Value;
  translateY: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
};

type CloudPuff = {
  id: number;
  x: number;
  y: number;
  size: number;
  translateX: Animated.Value;
  translateY: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
};

const CIRCLE_RADII: BubbleRadii = {
  borderTopLeftRadius: 999,
  borderTopRightRadius: 999,
  borderBottomLeftRadius: 999,
  borderBottomRightRadius: 999,
};

const randomRadius = () => Math.floor(Math.random() * 28) + 168;

const randomRadii = (): BubbleRadii => ({
  borderTopLeftRadius: randomRadius(),
  borderTopRightRadius: randomRadius(),
  borderBottomLeftRadius: randomRadius(),
  borderBottomRightRadius: randomRadius(),
});

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const lerp = (start: number, end: number, progress: number) =>
  start + (end - start) * progress;

const createJellyScale = (jellyLevel: number) => {
  const normalized = (jellyLevel - 1) / 5;
  return 0.65 + Math.pow(normalized, 1.75) * 1.85;
};

const createHoldWiggleProfile = (jellyScale: number): HoldWiggleProfile => ({
  drift: randomBetween(1.6, 2.5) * jellyScale,
  tilt: randomBetween(1.9, 3.1) * jellyScale,
  bounce: randomBetween(0.8, 1.6) * jellyScale,
  squash: randomBetween(0.015, 0.04) * jellyScale,
  durationA: randomBetween(220, 280),
  durationB: randomBetween(250, 320),
});

export function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const { setPeachPressed, jellyLevel, appMode, soundProfile, isSfxMuted } = usePeachPulse();
  const [activeSaying, setActiveSaying] = useState<string>('Bounce the Booty');
  const [typedSaying, setTypedSaying] = useState<string>('');
  const [cursorVisible, setCursorVisible] = useState<boolean>(false);
  const [isPressingPeach, setIsPressingPeach] = useState(false);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [requiresDismiss, setRequiresDismiss] = useState(false);
  const [bubbleActive, setBubbleActive] = useState(false);
  const [bubbleColorIndex, setBubbleColorIndex] = useState(0);
  const [bubbleRadii, setBubbleRadii] = useState<BubbleRadii>(CIRCLE_RADII);
  const [releaseParticles, setReleaseParticles] = useState<ReleaseParticle[]>([]);
  const [resultCloudPuffs, setResultCloudPuffs] = useState<CloudPuff[]>([]);
  const [showResultCloud, setShowResultCloud] = useState(false);
  const bubbleRadiiRef = useRef<BubbleRadii>(CIRCLE_RADII);
  const bubbleRadiiTweenRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressStartedAtRef = useRef<number>(0);
  const pressPointRef = useRef({ x: 180, y: 180 });
  const requiresDismissRef = useRef(false);
  const bubbleStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const releaseParticleCleanupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultCloudCleanupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleIdRef = useRef(0);
  const bubbleSpin = useRef(new Animated.Value(0)).current;
  const resultTranslateX = useRef(new Animated.Value(0)).current;
  const resultTranslateY = useRef(new Animated.Value(0)).current;
  const resultRevealProgress = useRef(new Animated.Value(1)).current;
  const peachBounceY = useRef(new Animated.Value(0)).current;
  const peachSquashX = useRef(new Animated.Value(1)).current;
  const peachSquashY = useRef(new Animated.Value(1)).current;
  const peachIdleScale = useRef(new Animated.Value(1)).current;
  const peachTilt = useRef(new Animated.Value(0)).current;
  const peachDriftX = useRef(new Animated.Value(0)).current;
  const peachBaseOffsetY = useRef(new Animated.Value(PEACH_Y_OFFSET)).current;
  const holdWiggleLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const idlePulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const releaseSoundRef = useRef<Audio.Sound | null>(null);
  const holdSoundRef = useRef<Audio.Sound | null>(null);
  const holdSoundTokenRef = useRef(0);
  const jellyScale = useMemo(() => createJellyScale(jellyLevel), [jellyLevel]);
  const holdWiggleProfileRef = useRef<HoldWiggleProfile>(createHoldWiggleProfile(jellyScale));

  const allSayings = useMemo(() => {
    if (appMode === 'decision') {
      return decisionSayings;
    }

    if (appMode === 'duell') {
      return duellPlaceholderSayings;
    }

    return destinySayings;
  }, [appMode]);

  const spawnReleaseParticles = (originX: number, originY: number) => {
    if (releaseParticleCleanupTimeoutRef.current) {
      clearTimeout(releaseParticleCleanupTimeoutRef.current);
      releaseParticleCleanupTimeoutRef.current = null;
    }

    const particles = Array.from({ length: 24 }, () => {
      const angle = randomBetween(0, Math.PI * 2);
      const distance = randomBetween(40, 122);
      const duration = Math.round(randomBetween(460, 860));
      const size = Math.round(randomBetween(8, 18));
      const color =
        RELEASE_PARTICLE_COLORS[
          Math.floor(Math.random() * RELEASE_PARTICLE_COLORS.length)
        ];

      const particle: ReleaseParticle = {
        id: particleIdRef.current,
        originX,
        originY,
        size,
        color,
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(1),
      };

      particleIdRef.current += 1;

      Animated.parallel([
        Animated.timing(particle.translateX, {
          toValue: Math.cos(angle) * distance,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: Math.sin(angle) * distance,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(particle.scale, {
          toValue: 0.12,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      return particle;
    });

    setReleaseParticles(particles);
    releaseParticleCleanupTimeoutRef.current = setTimeout(() => {
      setReleaseParticles([]);
      releaseParticleCleanupTimeoutRef.current = null;
    }, 980);
  };

  const runResultRevealCloud = () => {
    if (resultCloudCleanupTimeoutRef.current) {
      clearTimeout(resultCloudCleanupTimeoutRef.current);
      resultCloudCleanupTimeoutRef.current = null;
    }

    const puffs = Array.from({ length: 18 }, () => {
      const size = Math.round(randomBetween(30, 86));

      const puff: CloudPuff = {
        id: particleIdRef.current,
        x: randomBetween(-6, 326),
        y: randomBetween(-10, 84),
        size,
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(0.32),
      };

      particleIdRef.current += 1;

      Animated.parallel([
        Animated.timing(puff.translateX, {
          toValue: randomBetween(-34, 34),
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(puff.translateY, {
          toValue: randomBetween(-42, -12),
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(puff.opacity, {
          toValue: 0,
          duration: 360,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(puff.scale, {
          toValue: 1.9,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      return puff;
    });

    setResultCloudPuffs(puffs);
    setShowResultCloud(true);
    resultRevealProgress.setValue(0);

    Animated.timing(resultRevealProgress, {
      toValue: 1,
      duration: 280,
      delay: 160,
      easing: Easing.out(Easing.back(1.25)),
      useNativeDriver: true,
    }).start();

    resultCloudCleanupTimeoutRef.current = setTimeout(() => {
      setShowResultCloud(false);
      setResultCloudPuffs([]);
      resultCloudCleanupTimeoutRef.current = null;
    }, 620);
  };

  const selectRandomSaying = () => {
    if (appMode === 'bounce') {
      return;
    }

    const randomIndex = Math.floor(Math.random() * allSayings.length);
    setActiveSaying(allSayings[randomIndex]);
    setIsResultVisible(true);
    setRequiresDismiss(true);
    resultTranslateX.setValue(0);
    resultTranslateY.setValue(0);
    runResultRevealCloud();
  };

  const isBounceLabel = activeSaying === 'Bounce the Booty';

  useEffect(() => {
    if (appMode === 'bounce') {
      setIsResultVisible(false);
      setRequiresDismiss(false);
      setActiveSaying('Bounce the Booty');
      setTypedSaying('');
      setShowResultCloud(false);
      setResultCloudPuffs([]);
      setReleaseParticles([]);
      resultRevealProgress.setValue(1);
      return;
    }

    setActiveSaying('Bounce the Booty');
    setIsResultVisible(false);
    setRequiresDismiss(false);
    resultRevealProgress.setValue(1);
  }, [appMode]);

  const animateTo = (
    value: Animated.Value,
    toValue: number,
    duration: number,
    easing: ((value: number) => number) = Easing.out(Easing.cubic)
  ) =>
    Animated.timing(value, {
      toValue,
      duration,
      easing,
      useNativeDriver: true,
    });

  const runPeachBounce = (holdMs: number) => {
    const holdProgress = Math.min(1, Math.max(0, holdMs / 900));
    const holdFactor = Math.min(1.85, Math.max(0.25, holdMs / 650)) * jellyScale;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const firstLift = randomBetween(16, 26) * holdFactor;
    const firstTilt = randomBetween(5, 10) * holdFactor * direction;
    const firstDrift = randomBetween(4, 10) * direction;
    const squash = randomBetween(0.12, 0.22) * holdFactor;
    const isExtremeJelly = jellyLevel >= 6;
    const tailDuration = isExtremeJelly
      ? randomBetween(3000, 6000)
      : randomBetween(1200, 2400) + holdProgress * 900;
    const totalOscillations = isExtremeJelly
      ? 10 + Math.round(holdProgress * 5)
      : 5 + Math.round(holdProgress * 3) + Math.max(0, jellyLevel - 3);
    const oscillationDecay = isExtremeJelly ? 0.76 : 0.64;

    peachBounceY.stopAnimation();
    peachSquashX.stopAnimation();
    peachSquashY.stopAnimation();
    peachTilt.stopAnimation();
    peachDriftX.stopAnimation();

    const jellySequence = [
      Animated.parallel([
        animateTo(peachBounceY, randomBetween(6, 10), 90, Easing.in(Easing.quad)),
        animateTo(peachSquashX, 1 + squash * 0.95, 90, Easing.in(Easing.quad)),
        animateTo(peachSquashY, 1 - squash, 90, Easing.in(Easing.quad)),
        animateTo(peachTilt, direction * randomBetween(2, 4), 90, Easing.in(Easing.quad)),
      ]),
      Animated.parallel([
        animateTo(peachBounceY, -firstLift, 150, Easing.out(Easing.back(1.1))),
        animateTo(peachSquashX, 1 - squash * 0.5, 150, Easing.out(Easing.back(1.1))),
        animateTo(peachSquashY, 1 + squash * 0.65, 150, Easing.out(Easing.back(1.1))),
        animateTo(peachTilt, firstTilt, 150, Easing.out(Easing.back(1.1))),
        animateTo(peachDriftX, firstDrift, 150, Easing.out(Easing.back(1.1))),
      ]),
    ];

    const baseTailStepDuration = Math.max(
      isExtremeJelly ? 220 : 140,
      tailDuration / (totalOscillations + 1)
    );

    for (let index = 0; index < totalOscillations; index += 1) {
      const decay = Math.pow(oscillationDecay, index + 1);
      const side = index % 2 === 0 ? -1 : 1;
      const stepDuration = Math.round(baseTailStepDuration + index * (isExtremeJelly ? 14 : 10));

      jellySequence.push(
        Animated.parallel([
          animateTo(
            peachBounceY,
            side * firstLift * 0.34 * decay,
            stepDuration,
            Easing.inOut(Easing.sin)
          ),
          animateTo(
            peachDriftX,
            side * firstDrift * 0.55 * decay,
            stepDuration,
            Easing.inOut(Easing.sin)
          ),
          animateTo(
            peachTilt,
            side * firstTilt * 0.55 * decay,
            stepDuration,
            Easing.inOut(Easing.sin)
          ),
          animateTo(
            peachSquashX,
            1 + squash * 0.28 * decay,
            stepDuration,
            Easing.inOut(Easing.sin)
          ),
          animateTo(
            peachSquashY,
            1 - squash * 0.28 * decay,
            stepDuration,
            Easing.inOut(Easing.sin)
          ),
        ])
      );
    }

    jellySequence.push(
      Animated.parallel([
        animateTo(peachBounceY, 0, 280, Easing.out(Easing.cubic)),
        animateTo(peachDriftX, 0, 280, Easing.out(Easing.cubic)),
        animateTo(peachTilt, 0, 280, Easing.out(Easing.cubic)),
        animateTo(peachSquashX, 1, 280, Easing.out(Easing.cubic)),
        animateTo(peachSquashY, 1, 280, Easing.out(Easing.cubic)),
      ])
    );

    Animated.sequence(jellySequence).start();
  };

  const playRandomReleaseSound = async () => {
    if (isSfxMuted) {
      return;
    }

    const soundPool = releaseSoundsByProfile[soundProfile];
    if (!soundPool || soundPool.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * soundPool.length);
    const selectedSound = soundPool[randomIndex];

    try {
      if (releaseSoundRef.current) {
        await releaseSoundRef.current.unloadAsync();
        releaseSoundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(selectedSound, {
        shouldPlay: true,
      });
      releaseSoundRef.current = sound;
    } catch {
    }
  };

  const playRandomHoldSound = async () => {
    if (isSfxMuted) {
      return;
    }

    const token = holdSoundTokenRef.current;
    const soundPool = holdSoundsByProfile[soundProfile];
    if (!soundPool || soundPool.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * soundPool.length);
    const selectedSound = soundPool[randomIndex];

    try {
      if (holdSoundRef.current) {
        await holdSoundRef.current.unloadAsync();
        holdSoundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(selectedSound, {
        shouldPlay: true,
        isLooping: true,
        volume: 0.15,
      });

      if (token !== holdSoundTokenRef.current) {
        await sound.unloadAsync();
        return;
      }

      holdSoundRef.current = sound;
    } catch {
    }
  };

  const stopHoldSound = async () => {
    if (!holdSoundRef.current) {
      return;
    }

    try {
      await holdSoundRef.current.stopAsync();
      await holdSoundRef.current.unloadAsync();
    } catch {
    } finally {
      holdSoundRef.current = null;
    }
  };

  const stopReleaseSound = async () => {
    if (!releaseSoundRef.current) {
      return;
    }

    try {
      await releaseSoundRef.current.stopAsync();
      await releaseSoundRef.current.unloadAsync();
    } catch {
    } finally {
      releaseSoundRef.current = null;
    }
  };

  useEffect(() => {
    holdWiggleProfileRef.current = createHoldWiggleProfile(jellyScale);
  }, [jellyScale]);

  useEffect(() => {
    requiresDismissRef.current = requiresDismiss;
  }, [requiresDismiss]);

  const resetResultCardPosition = () => {
    Animated.parallel([
      Animated.spring(resultTranslateX, {
        toValue: 0,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.spring(resultTranslateY, {
        toValue: 0,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const dismissResultCard = (axis: 'x' | 'y', direction: 1 | -1) => {
    const targetX = axis === 'x' ? direction * (width + 120) : 0;
    const targetY = axis === 'y' ? direction * (height + 120) : 0;

    Animated.parallel([
      Animated.timing(resultTranslateX, {
        toValue: targetX,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(resultTranslateY, {
        toValue: targetY,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsResultVisible(false);
      setRequiresDismiss(false);
      resultTranslateX.setValue(0);
      resultTranslateY.setValue(0);
    });
  };

  const resultCardPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        requiresDismissRef.current &&
        (Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6),
      onPanResponderMove: Animated.event(
        [null, { dx: resultTranslateX, dy: resultTranslateY }],
        {
          useNativeDriver: false,
        }
      ),
      onPanResponderRelease: (_, gestureState) => {
        const absDx = Math.abs(gestureState.dx);
        const absDy = Math.abs(gestureState.dy);

        if (absDx >= absDy && gestureState.dx > 90) {
          dismissResultCard('x', 1);
          return;
        }

        if (absDx >= absDy && gestureState.dx < -90) {
          dismissResultCard('x', -1);
          return;
        }

        if (absDy > absDx && gestureState.dy > 90) {
          dismissResultCard('y', 1);
          return;
        }

        if (absDy > absDx && gestureState.dy < -90) {
          dismissResultCard('y', -1);
          return;
        }

        resetResultCardPosition();
      },
      onPanResponderTerminate: resetResultCardPosition,
    })
  ).current;

  const resultCardOpacityX = resultTranslateX.interpolate({
    inputRange: [-220, 0, 220],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  const resultCardOpacityY = resultTranslateY.interpolate({
    inputRange: [-220, 0, 220],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  const resultCardOpacity = Animated.multiply(resultCardOpacityX, resultCardOpacityY);

  useEffect(() => {
    let index = 0;
    let typingInterval: ReturnType<typeof setInterval> | undefined;
    setTypedSaying('');
    setCursorVisible(true);

    const startDelay = setTimeout(() => {
      typingInterval = setInterval(() => {
        index += 1;
        setTypedSaying(activeSaying.slice(0, index));

        if (index >= activeSaying.length) {
          if (typingInterval) {
            clearInterval(typingInterval);
          }
          setCursorVisible(false);
        }
      }, 52);
    }, 200);

    return () => {
      clearTimeout(startDelay);
      if (typingInterval) {
        clearInterval(typingInterval);
      }
    };
  }, [activeSaying]);

  useEffect(() => {
    if (!isSfxMuted) {
      return;
    }

    holdSoundTokenRef.current += 1;
    void stopHoldSound();
    void stopReleaseSound();
  }, [isSfxMuted]);

  useEffect(() => {
    if (typedSaying.length >= activeSaying.length) {
      return;
    }

    const cursorInterval = setInterval(() => {
      setCursorVisible((previous) => !previous);
    }, 460);

    return () => clearInterval(cursorInterval);
  }, [typedSaying.length, activeSaying.length]);

  useEffect(() => {
    const setNextBubbleRadii = (nextRadii: BubbleRadii) => {
      bubbleRadiiRef.current = nextRadii;
      setBubbleRadii(nextRadii);
    };

    const animateBubbleRadiiToCircle = (duration = 170) => {
      if (bubbleRadiiTweenRef.current) {
        clearInterval(bubbleRadiiTweenRef.current);
        bubbleRadiiTweenRef.current = null;
      }

      const startRadii = bubbleRadiiRef.current;
      const startedAt = Date.now();

      bubbleRadiiTweenRef.current = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3);

        setNextBubbleRadii({
          borderTopLeftRadius: lerp(startRadii.borderTopLeftRadius, CIRCLE_RADII.borderTopLeftRadius, eased),
          borderTopRightRadius: lerp(startRadii.borderTopRightRadius, CIRCLE_RADII.borderTopRightRadius, eased),
          borderBottomLeftRadius: lerp(startRadii.borderBottomLeftRadius, CIRCLE_RADII.borderBottomLeftRadius, eased),
          borderBottomRightRadius: lerp(startRadii.borderBottomRightRadius, CIRCLE_RADII.borderBottomRightRadius, eased),
        });

        if (progress >= 1) {
          if (bubbleRadiiTweenRef.current) {
            clearInterval(bubbleRadiiTweenRef.current);
            bubbleRadiiTweenRef.current = null;
          }

          setNextBubbleRadii(CIRCLE_RADII);
        }
      }, 16);
    };

    if (!bubbleActive) {
      bubbleSpin.stopAnimation();
      bubbleSpin.setValue(0);
      animateBubbleRadiiToCircle();
      return;
    }

    const rotation = Animated.loop(
      Animated.timing(bubbleSpin, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    rotation.start();

    const morphInterval = setInterval(() => {
      setNextBubbleRadii(randomRadii());
    }, 1000);

    const colorInterval = setInterval(() => {
      setBubbleColorIndex((previous) => (previous + 1) % BUBBLE_COLORS.length);
    }, 3750);

    return () => {
      rotation.stop();
      bubbleSpin.stopAnimation();
      bubbleSpin.setValue(0);
      clearInterval(morphInterval);
      clearInterval(colorInterval);

      if (bubbleRadiiTweenRef.current) {
        clearInterval(bubbleRadiiTweenRef.current);
        bubbleRadiiTweenRef.current = null;
      }
    };
  }, [bubbleActive, bubbleSpin]);

  useEffect(() => {
    if (isPressingPeach) {
      peachBounceY.stopAnimation();
      peachSquashX.stopAnimation();
      peachSquashY.stopAnimation();
      peachTilt.stopAnimation();
      peachDriftX.stopAnimation();

      const profile = holdWiggleProfileRef.current;

      const holdLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            animateTo(
              peachDriftX,
              profile.drift,
              profile.durationA,
              Easing.inOut(Easing.cubic)
            ),
            animateTo(
              peachTilt,
              profile.tilt,
              profile.durationA,
              Easing.inOut(Easing.cubic)
            ),
            animateTo(
              peachBounceY,
              profile.bounce,
              profile.durationA,
              Easing.inOut(Easing.cubic)
            ),
            animateTo(
              peachSquashX,
              1 + profile.squash,
              profile.durationA,
              Easing.inOut(Easing.cubic)
            ),
            animateTo(
              peachSquashY,
              1 - profile.squash,
              profile.durationA,
              Easing.inOut(Easing.cubic)
            ),
          ]),
          Animated.parallel([
            animateTo(
              peachDriftX,
              -profile.drift,
              profile.durationB,
              Easing.inOut(Easing.cubic)
            ),
            animateTo(
              peachTilt,
              -profile.tilt,
              profile.durationB,
              Easing.inOut(Easing.cubic)
            ),
            animateTo(
              peachBounceY,
              -profile.bounce * 0.85,
              profile.durationB,
              Easing.inOut(Easing.cubic)
            ),
            animateTo(
              peachSquashX,
              1 - profile.squash,
              profile.durationB,
              Easing.inOut(Easing.cubic)
            ),
            animateTo(
              peachSquashY,
              1 + profile.squash,
              profile.durationB,
              Easing.inOut(Easing.cubic)
            ),
          ]),
        ])
      );

      holdWiggleLoopRef.current = holdLoop;
      holdLoop.start();

      return;
    }

    if (holdWiggleLoopRef.current) {
      holdWiggleLoopRef.current.stop();
      holdWiggleLoopRef.current = null;
    }
  }, [
    isPressingPeach,
    peachBounceY,
    peachDriftX,
    peachSquashX,
    peachSquashY,
    peachTilt,
  ]);

  useEffect(() => {
    if (isPressingPeach) {
      if (idlePulseLoopRef.current) {
        idlePulseLoopRef.current.stop();
        idlePulseLoopRef.current = null;
      }

      peachIdleScale.stopAnimation();
      peachIdleScale.setValue(1);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(peachIdleScale, {
          toValue: 1.04,
          duration: 1080,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(peachIdleScale, {
          toValue: 1,
          duration: 1080,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    idlePulseLoopRef.current = pulseLoop;
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
      if (idlePulseLoopRef.current === pulseLoop) {
        idlePulseLoopRef.current = null;
      }
    };
  }, [isPressingPeach, peachIdleScale]);

  useEffect(() => {
    return () => {
      if (bubbleStopTimeoutRef.current) {
        clearTimeout(bubbleStopTimeoutRef.current);
      }

      if (releaseParticleCleanupTimeoutRef.current) {
        clearTimeout(releaseParticleCleanupTimeoutRef.current);
      }

      if (resultCloudCleanupTimeoutRef.current) {
        clearTimeout(resultCloudCleanupTimeoutRef.current);
      }

      if (holdWiggleLoopRef.current) {
        holdWiggleLoopRef.current.stop();
      }

      if (idlePulseLoopRef.current) {
        idlePulseLoopRef.current.stop();
      }

      if (releaseSoundRef.current) {
        releaseSoundRef.current.unloadAsync();
      }

      if (holdSoundRef.current) {
        holdSoundRef.current.unloadAsync();
      }

      if (bubbleRadiiTweenRef.current) {
        clearInterval(bubbleRadiiTweenRef.current);
      }
    };
  }, [holdWiggleLoopRef]);

  const bubbleRotate = bubbleSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const peachRotate = peachTilt.interpolate({
    inputRange: [-25, 25],
    outputRange: ['-25deg', '25deg'],
  });

  const peachCircleScaleX = peachSquashX.interpolate({
    inputRange: [0.6, 1, 1.6],
    outputRange: [0.88, 1, 1.14],
    extrapolate: 'clamp',
  });

  const peachCircleScaleY = peachSquashY.interpolate({
    inputRange: [0.6, 1, 1.6],
    outputRange: [0.88, 1, 1.14],
    extrapolate: 'clamp',
  });

  const peachTranslateY = Animated.add(peachBaseOffsetY, peachBounceY);
  const shouldDismissOnPeachPress = appMode !== 'bounce' && requiresDismiss && isResultVisible;
  const resultCardRevealScale = resultRevealProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
    extrapolate: 'clamp',
  });
  const resultCardFinalOpacity = Animated.multiply(resultCardOpacity, resultRevealProgress);

  return (
    <ScreenContainer>
      <View style={styles.centerArea}>
        {isResultVisible && appMode !== 'bounce' ? (
          <Pressable style={styles.resultBackdrop} onPress={() => dismissResultCard('y', -1)} />
        ) : null}

        <Pressable
          onPressIn={(event) => {
            if (shouldDismissOnPeachPress) {
              dismissResultCard('y', -1);
              return;
            }

            pressPointRef.current = {
              x: event.nativeEvent.locationX,
              y: event.nativeEvent.locationY,
            };

            pressStartedAtRef.current = Date.now();
            holdWiggleProfileRef.current = createHoldWiggleProfile(jellyScale);
            setPeachPressed(true);
            setIsPressingPeach(true);
            holdSoundTokenRef.current += 1;
            void playRandomHoldSound();

            if (bubbleStopTimeoutRef.current) {
              clearTimeout(bubbleStopTimeoutRef.current);
              bubbleStopTimeoutRef.current = null;
            }

            setBubbleActive(true);
          }}
          onPressOut={() => {
            if (shouldDismissOnPeachPress) {
              return;
            }

            setPeachPressed(false);
            setIsPressingPeach(false);
            holdSoundTokenRef.current += 1;
            void stopHoldSound();

            void playRandomReleaseSound();
            spawnReleaseParticles(pressPointRef.current.x, pressPointRef.current.y);

            bubbleStopTimeoutRef.current = setTimeout(() => {
              setBubbleActive(false);
            }, 900);

            const heldForMs = Date.now() - pressStartedAtRef.current;
            runPeachBounce(heldForMs);

            if (heldForMs >= MIN_PRESS_MS && appMode !== 'bounce') {
              selectRandomSaying();
            }
          }}
          style={styles.peachButton}
        >
          <Animated.View
            style={[
              styles.peachGradient,
              bubbleRadii,
              {
                backgroundColor: BUBBLE_COLORS[bubbleColorIndex],
                transform: [{ scaleX: peachCircleScaleX }, { scaleY: peachCircleScaleY }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.peachGradientAnimatedLayer,
                { transform: [{ rotate: bubbleRotate }] },
              ]}
            >
              <LinearGradient
                colors={[BUBBLE_COLORS[bubbleColorIndex], '#FCEBD4', colors.mint]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.peachGradientInner}
              />
            </Animated.View>

            <View style={styles.peachContentLayer}>
              <Animated.Image
                source={peachImage}
                style={[
                  styles.peachImage,
                  {
                    transform: [
                      { translateX: peachDriftX },
                      { translateY: peachTranslateY },
                      { rotate: peachRotate },
                      { scaleX: peachSquashX },
                      { scaleY: peachSquashY },
                      { scale: peachIdleScale },
                    ],
                  },
                ]}
                resizeMode="contain"
              />
              <Text style={styles.peachHint}>Bounce the Booty</Text>
            </View>

            <View pointerEvents="none" style={styles.releaseParticlesLayer}>
              {releaseParticles.map((particle) => (
                <Animated.View
                  key={particle.id}
                  style={[
                    styles.releaseParticle,
                    {
                      left: particle.originX - particle.size / 2,
                      top: particle.originY - particle.size / 2,
                      width: particle.size,
                      height: particle.size,
                      backgroundColor: particle.color,
                      opacity: particle.opacity,
                      transform: [
                        { translateX: particle.translateX },
                        { translateY: particle.translateY },
                        { scale: particle.scale },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        </Pressable>

        {showResultCloud && appMode !== 'bounce' ? (
          <View pointerEvents="none" style={styles.resultCloudLayer}>
            {resultCloudPuffs.map((puff) => (
              <Animated.View
                key={puff.id}
                style={[
                  styles.resultCloudPuff,
                  {
                    left: puff.x,
                    top: puff.y,
                    width: puff.size,
                    height: puff.size,
                    opacity: puff.opacity,
                    transform: [
                      { translateX: puff.translateX },
                      { translateY: puff.translateY },
                      { scale: puff.scale },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        ) : null}

        {isResultVisible && appMode !== 'bounce' ? (
          <Animated.View
            {...resultCardPanResponder.panHandlers}
            style={[
              styles.resultCard,
              {
                opacity: resultCardFinalOpacity,
                transform: [
                  { translateX: resultTranslateX },
                  { translateY: resultTranslateY },
                  { scale: resultCardRevealScale },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[colors.surface, '#FFF4E6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resultCardGradient}
            >
              <Text style={[styles.result, isBounceLabel && styles.resultBounce]}>
                {typedSaying}
                {cursorVisible ? '|' : ' '}
              </Text>
            </LinearGradient>
          </Animated.View>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    overflow: 'visible',
  },
  peachButton: {
    position: 'relative',
    zIndex: 11,
    marginTop: 40,
    borderRadius: 999,
    overflow: 'visible',
    shadowColor: '#E7BC8B',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 5,
  },
  peachGradient: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    width: 360,
    height: 360,
  },
  peachGradientAnimatedLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  peachGradientInner: {
    flex: 1,
  },
  releaseParticlesLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  releaseParticle: {
    position: 'absolute',
    borderRadius: 999,
  },
  peachContentLayer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    gap: 8,
  },
  peachImage: {
    width: 400,
    height: 400,
    zIndex: 999999999999999999999,
  },
  peachHint: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'MoonFlower',
  },
  resultCard: {
    zIndex: 12,
    position: 'absolute',
    bottom: 36,
    overflow: 'hidden',
    borderRadius: 12,
    width: '94%',
    maxWidth: 390,
  },
  resultBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  resultCloudLayer: {
    position: 'absolute',
    bottom: 36,
    zIndex: 13,
    width: '94%',
    maxWidth: 390,
    height: 120,
    overflow: 'visible',
    pointerEvents: 'none',
  },
  resultCloudPuff: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  resultCardGradient: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  result: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 42,
    fontFamily: 'MoonFlower',
  },
  resultBounce: {
    fontFamily: 'UrbanBlocker',
    fontWeight: 'normal',
    fontSize: 48,
    lineHeight: 54,
    letterSpacing: 0.5,
  },
});