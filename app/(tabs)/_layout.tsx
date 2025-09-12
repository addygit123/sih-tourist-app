import { Tabs } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AntDesign } from '@expo/vector-icons';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

export const ContactsContext = createContext<{contacts: any[]; setContacts: (c: any[]) => void;}>({ contacts: [], setContacts: () => {} });


export default function TabLayout() {
  const colorScheme = useColorScheme();
   const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      const saved = await SecureStore.getItemAsync('contacts');
      if (saved) setContacts(JSON.parse(saved));
    };
    fetchContacts();
  }, []);

  return (
    <ContactsContext.Provider value={{ contacts, setContacts }}>
    <Tabs
      screenOptions={{
        animation:'shift',
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          android:{
            backgroundColor: Colors.light.background,
            height: '12%'
          },
          default: {},
        }),
        tabBarInactiveTintColor:'lightgray',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, }) => <AntDesign size={28} name="home"  color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Contacts', 
          tabBarIcon: ({ color, focused }) => <MaterialDesignIcons size={28} name={focused ? 'contacts' : 'contacts-outline'} color={color} />,
        }}
      />      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile', 
          tabBarIcon: ({ color, focused }) => <MaterialDesignIcons size={28} name={focused ? 'account' : 'account-outline'} color={color} />,
        }}
      />
    </Tabs>
    </ContactsContext.Provider>
  );
}
