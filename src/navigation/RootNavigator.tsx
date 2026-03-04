import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
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

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#F9E9D1' },
          headerTitleStyle: {
            color: colors.text,
            fontWeight: 'bold',
            fontFamily: 'MoonFlower',
            fontSize: 34,
          },
          headerTintColor: '#C88647',
          contentStyle: { backgroundColor: colors.background },
          headerRight: () => <Text style={{ fontSize: 30 }}>🍑</Text>,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Destiny Booty' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}