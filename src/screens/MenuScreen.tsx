import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';
import { usePeachPulse } from '../state/PeachPulseContext';
import { colors } from '../theme/colors';

export function MenuScreen() {
  const { jellyLevel, setJellyLevel } = usePeachPulse();

  return (
    <LinearGradient
      colors={[colors.peachLight, colors.peachMid, '#E89D5B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Menü</Text>
        <Text style={styles.item}>- Start</Text>
        <Text style={styles.item}>- Einstellungen</Text>
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
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
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
});