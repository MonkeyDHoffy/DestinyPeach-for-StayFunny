import { ReactNode } from 'react';
import { Animated, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePeachPulse } from '../../state/PeachPulseContext';
import { colors } from '../../theme/colors';

const appBackground = require('../../../assets/pics/background.jpg');
const footerLogo = require('../../../assets/pics/print.png');

type ScreenContainerProps = {
  children: ReactNode;
};

export function ScreenContainer({ children }: ScreenContainerProps) {
  const { motion } = usePeachPulse();

  const footerShift = motion.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 90, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[colors.peachLight, colors.peachMid, '#E89D5B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientFill}
      />

      <ImageBackground
        source={appBackground}
        resizeMode="contain"
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.content}>{children}</View>
      </ImageBackground>

      <View style={styles.footer}>
        <Animated.View
          pointerEvents="none"
          style={[styles.footerGradientAnimated, { transform: [{ translateX: footerShift }] }]}
        >
          <LinearGradient
            colors={['#F9E9D1', colors.peachLight, colors.peachMid, colors.mint, '#F9E9D1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.footerGradientFill}
          />
        </Animated.View>

        <Pressable style={styles.leftButton}>
          <Text style={styles.leftButtonText}>Menü</Text>
        </Pressable>

        <Image source={footerLogo} resizeMode="contain" style={styles.footerWordmark} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.peachMid,
  },
  gradientFill: {
    ...StyleSheet.absoluteFillObject,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 110,
    gap: 16,
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
    overflow: 'hidden',
  },
  footerGradientAnimated: {
    ...StyleSheet.absoluteFillObject,
    width: '190%',
    left: '-45%',
  },
  footerGradientFill: {
    flex: 1,
  },
  leftButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 249, 240, 0.92)',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftButtonText: {
    fontFamily: 'MoonFlower',
    fontSize: 20,
    color: colors.text,
  },
  footerWordmark: {
    width: 140,
    height: 40,
  },
});