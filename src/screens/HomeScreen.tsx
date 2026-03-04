import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import sayings from '../data/sayings.json';
import { colors } from '../theme/colors';

const peachImage = require('../../assets/pics/finalpeach.png');
const PEACH_Y_OFFSET = 28;

export function HomeScreen() {
  const [activeSaying, setActiveSaying] = useState<string>('Bounce the Booty');

  const allSayings = useMemo(() => sayings as string[], []);

  const selectRandomSaying = () => {
    const randomIndex = Math.floor(Math.random() * allSayings.length);
    setActiveSaying(allSayings[randomIndex]);
  };

  const isBounceLabel = activeSaying === 'Bounce the Booty';

  return (
    <ScreenContainer>
      <View style={styles.centerArea}>
        <LinearGradient
          colors={[colors.surface, '#FFF4E6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.resultCard}
        >
          <Text style={[styles.result, isBounceLabel && styles.resultBounce]}>
            {activeSaying}
          </Text>
        </LinearGradient>

        <Pressable onPress={selectRandomSaying} style={styles.peachButton}>
          <LinearGradient
            colors={[colors.background, '#FCEBD4', colors.mint]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.peachGradient}
          >
            <Image source={peachImage} style={styles.peachImage} resizeMode="contain" />
            <Text style={styles.peachHint}>Bounce the Booty</Text>
          </LinearGradient>
        </Pressable>
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
  },
  peachButton: {
    marginTop: 12,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#E7BC8B',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 5,
  },
  peachGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    width: 360,
    height: 360,
    gap: 8,
  },
  peachImage: {
    width: 400,
    height: 400,
    transform: [{ translateY: PEACH_Y_OFFSET }],
    zIndex: 999999999999999999999,
  },
  peachHint: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'MoonFlower',
  },
  resultCard: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '100%',
    maxWidth: 360,
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