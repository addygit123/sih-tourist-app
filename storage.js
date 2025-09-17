import { MMKV } from 'react-native-mmkv';


const storage = new MMKV({
    id:'app-storage',
    encryptionKey:process.env.MMKV_KEY
})

export const MMKVStorage =  {
    setItem: (key, value) => storage.set(key, value),
    getItem: (key) => storage.getString(key) ?? null,
    removeItem: (key) => storage.delete(key),
};