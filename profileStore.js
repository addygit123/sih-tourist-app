import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { MMKVStorage } from './storage'

export const useprofileStore = create(
    persist(
        (set, get) => ({
            profile: null,
            login:false,
            setLogin: () => set({login: true}),
            setLogout: () => set({login: false}),
            setProfile: (profile) => set({profile}),
            clearProfile: () => set({profile: null}),
            addContact: (phone) => set((state) => ({profile: {...state.profile, contacts: [...state.profile.contacts, phone]}}))
        }),
        {
            name: 'profile-store',
            storage: createJSONStorage(() => MMKVStorage)
        }
    )
)