import { useprofileStore } from '@/profileStore';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import './global.css';

export default function RootLayout() {
  const {login, setLogin} = useprofileStore()
  console.log('profile', login);

  return (
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Protected guard={login}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack.Protected>

          <Stack.Protected guard={!login}>
            <Stack.Screen name="setup" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>

  );
}
