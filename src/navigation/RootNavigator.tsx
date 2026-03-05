import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { usePeachPulse } from '../state/PeachPulseContext';
import { colors } from '../theme/colors';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
    notification: colors.primary,
  },
};

function HeaderGradientBackground() {
  const { motion } = usePeachPulse();

  const headerShift = motion.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 65, 0],
  });

  return (
    <View style={styles.headerBackgroundBase}>
      <Animated.View
        pointerEvents="none"
        style={[styles.headerGradientAnimated, { transform: [{ translateX: headerShift }] }]}
      >
        <LinearGradient
          colors={['#F9E9D1', colors.peachLight, colors.peachMid, colors.mint, '#F9E9D1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradientFill}
        />
      </Animated.View>
    </View>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={({ navigation, route }) => ({
          headerStyle: { backgroundColor: '#F9E9D1' },
          headerBackground: () => <HeaderGradientBackground />,
          headerTitleStyle: {
            color: colors.text,
            fontWeight: 'bold',
            fontFamily: 'MoonFlower',
            fontSize: 34,
          },
          headerTintColor: '#C88647',
          contentStyle: { backgroundColor: colors.background },
          headerRight:
            route.name === 'Home'
              ? () => (
                  <Pressable
                    onPress={() => navigation.navigate('Menu')}
                    style={styles.headerPeachButton}
                  >
                    <Text style={styles.headerPeachEmoji}>Menü</Text>
                  </Pressable>
                )
              : undefined,
        })}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Destiny Booty' }}
        />
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={{ title: 'Menü' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerBackgroundBase: {
    flex: 1,
    backgroundColor: '#F9E9D1',
    overflow: 'hidden',
  },
  headerGradientAnimated: {
    ...StyleSheet.absoluteFillObject,
    width: '180%',
    left: '-40%',
  },
  headerGradientFill: {
    flex: 1,
  },
  headerPeachButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 249, 240, 0.92)',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPeachEmoji: {
    fontSize: 22,
    fontFamily: 'MoonFlower',
    color: colors.text,
  },
});