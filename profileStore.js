import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MMKVStorage } from "./storage";

export const useprofileStore = create(
  persist(
    (set, get) => ({
      profile: null,
      login: false,
      setLogin: () => set({ login: true }),
      setLogout: () => set({ login: false }),
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
      lat: 0,
      long: 0,
      dp: "",
      onboarded: false,
      setPfp: (uri) => set((state) => ({ dp: uri })),
      setCoords: (lat, long) => set(() => ({ lat: lat, long: long })),
      remContact: (phone) =>
        set((state) => ({
          profile: {
            ...state.profile,
            contacts: state.profile.contacts.filter((c) => c[1] != phone),
          },
        })),
      addContact: (phone) =>
        set((state) => ({
          profile: {
            ...state.profile,
            contacts: [...state.profile.contacts, phone],
          },
        })),
      setOnboarded: () => set({ onboarded: true }),
      resetOnboarding: () => set({ onboarded: false }),
    }),
    {
      name: "profile-store",
      storage: createJSONStorage(() => MMKVStorage),
    },
  ),
);
