import { Tabs } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useEffect, useState } from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AntDesign } from "@expo/vector-icons";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";

export const ContactsContext = createContext<{
  contacts: any[];
  setContacts: (c: any[]) => void;
}>({ contacts: [], setContacts: () => {} });

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      const saved = await SecureStore.getItemAsync("contacts");
      if (saved) setContacts(JSON.parse(saved));
    };
    fetchContacts();
  }, []);

  return (
    <ContactsContext.Provider value={{ contacts, setContacts }}>
      <Tabs
        screenOptions={{
          animation: "shift",
          headerShown: false,
          tabBarButton: HapticTab,

          tabBarActiveTintColor: "#A78BFA",
          tabBarInactiveTintColor: "rgba(255,255,255,0.45)",

          tabBarStyle: Platform.select({
            ios: {
              position: "absolute",
              backgroundColor: "rgba(20,24,42,0.94)",
              borderTopColor: "rgba(255,255,255,0.06)",
            },

            android: {
              backgroundColor: "#14182A",
              borderTopColor: "rgba(255,255,255,0.06)",
              height: "13%",
            },

            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <AntDesign size={28} name="home" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="map"
          options={{
            title: "Map",
            tabBarIcon: ({ color }) => (
              <MaterialDesignIcons size={28} name="google-maps" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: "Contacts",
            tabBarIcon: ({ color, focused }) => (
              <MaterialDesignIcons
                size={28}
                name={focused ? "contacts" : "contacts-outline"}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <MaterialDesignIcons
                size={28}
                name={focused ? "account" : "account-outline"}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </ContactsContext.Provider>
  );
}
