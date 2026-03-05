import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { Image, StyleSheet, Text, View } from 'react-native';
import { usePeachPulse } from '../state/PeachPulseContext';
import { colors } from '../theme/colors';

const footerLogo = require('../../assets/pics/print.png');

export function MenuScreen() {
  const {
    jellyLevel,
    setJellyLevel,
    soundProfile,
    setSoundProfile,
    isMusicMuted,
    setIsMusicMuted,
    isSfxMuted,
    setIsSfxMuted,
  } = usePeachPulse();

  return (
    <LinearGradient
      colors={[colors.peachLight, colors.peachMid, '#E89D5B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.item}>- Über</Text>

        <View style={styles.sliderSection}>
          <Text style={styles.sliderLabel}>Jelly-Regler</Text>
          <Text style={styles.sliderValue}>Stärke: {jellyLevel} / 6</Text>
          <Slider
            minimumValue={1}
            maximumValue={6}
            step={1}
            value={jellyLevel}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.text}
            onValueChange={(value) => setJellyLevel(value)}
          />
        </View>

        <View style={styles.sliderSection}>
          <Text style={styles.sliderLabel}>Sounds</Text>
          <Text style={styles.sliderValue}>
            Aktiv: {soundProfile === 'classic' ? 'Klassisch' : 'Crazy'}
          </Text>

          <View style={styles.soundButtonsRow}>
            <Text
              onPress={() => setSoundProfile('classic')}
              style={[
                styles.soundButton,
                soundProfile === 'classic' && styles.soundButtonActive,
              ]}
            >
              Klassisch
            </Text>

            <Text
              onPress={() => setSoundProfile('crazy')}
              style={[
                styles.soundButton,
                soundProfile === 'crazy' && styles.soundButtonActive,
              ]}
            >
              Crazy
            </Text>
          </View>
        </View>

        <View style={styles.sliderSection}>
          <Text style={styles.sliderLabel}>Audio Mute</Text>

          <View style={styles.soundButtonsRow}>
            <Text
              onPress={() => setIsMusicMuted(!isMusicMuted)}
              style={[
                styles.soundButton,
                isMusicMuted && styles.soundButtonActive,
              ]}
            >
              Musik {isMusicMuted ? 'Aus' : 'An'}
            </Text>

            <Text
              onPress={() => setIsSfxMuted(!isSfxMuted)}
              style={[
                styles.soundButton,
                isSfxMuted && styles.soundButtonActive,
              ]}
            >
              SFX {isSfxMuted ? 'Aus' : 'An'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerLink}>www.hoffja.de</Text>
        <Image source={footerLogo} resizeMode="contain" style={styles.footerWordmark} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: 'rgba(255, 249, 240, 0.86)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  title: {
    color: colors.text,
    fontSize: 38,
    fontFamily: 'MoonFlower',
  },
  item: {
    color: colors.text,
    fontSize: 24,
    fontFamily: 'MoonFlower',
  },
  sliderSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 4,
  },
  sliderLabel: {
    color: colors.text,
    fontSize: 28,
    fontFamily: 'MoonFlower',
  },
  sliderValue: {
    color: colors.textMuted,
    fontSize: 20,
    fontFamily: 'MoonFlower',
  },
  soundButtonsRow: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 8,
  },
  soundButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.55)',
    color: colors.text,
    fontFamily: 'MoonFlower',
    fontSize: 22,
  },
  soundButtonActive: {
    backgroundColor: '#F2D8B8',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 74,
    paddingHorizontal: 16,
    backgroundColor: '#F9E9D1',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLink: {
    color: colors.text,
    fontFamily: 'MoonFlower',
    fontSize: 26,
  },
  footerWordmark: {
    width: 140,
    height: 40,
  },
});