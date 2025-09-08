import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { createContext, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import 'react-native-reanimated';
import './global.css';


export const ProfileContext = createContext<{ profile: boolean, setProfile: (p: boolean) => void }>({ profile: false, setProfile: () => {} });
export default function RootLayout() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(false)

   useEffect(() => {
    const checkProfile = async () => {
      const p = await SecureStore.getItemAsync('profile');
      console.log(p);
      
      if(p === null) {setProfile(false)}
      else {setProfile(true)}
      setLoading(false);
    };
    checkProfile();
  });

   if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Protected guard={profile}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack.Protected>

          <Stack.Protected guard={!profile}>
            <Stack.Screen name="setup" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>
    </ ProfileContext.Provider>

  );
}
