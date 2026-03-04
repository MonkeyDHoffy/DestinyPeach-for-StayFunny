import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

type ScreenContainerProps = {
  children: ReactNode;
};

export function ScreenContainer({ children }: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[colors.peachLight, colors.peachMid, '#E89D5B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>{children}</View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.peachMid,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
});