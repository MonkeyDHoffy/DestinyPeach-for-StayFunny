import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function MenuScreen() {
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
});