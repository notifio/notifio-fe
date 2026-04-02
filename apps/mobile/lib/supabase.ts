import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import * as aesjs from 'aes-js';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

/**
 * LargeSecureStore — official Supabase pattern for React Native.
 *
 * SecureStore has a 2048-byte limit; Supabase sessions exceed that (~2800 bytes).
 * An AES-256 key is stored in SecureStore (32 hex chars, well under limit).
 * Actual session data is encrypted with that key and stored in AsyncStorage.
 */
class LargeSecureStore {
  private async _encrypt(key: string, value: string): Promise<string> {
    const encryptionKey = await this._getOrCreateKey(key);
    const keyBytes = aesjs.utils.hex.toBytes(encryptionKey);
    const textBytes = aesjs.utils.utf8.toBytes(value);
    const padded = aesjs.padding.pkcs7.pad(textBytes);

    // Random IV for each encryption — stored as prefix of ciphertext
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const aesCbc = new aesjs.ModeOfOperation.cbc(keyBytes, iv);
    const encryptedBytes = aesCbc.encrypt(padded);

    // Prepend IV (32 hex chars) to ciphertext
    return aesjs.utils.hex.fromBytes(iv) + aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async _decrypt(key: string, value: string): Promise<string> {
    const encryptionKey = await this._getOrCreateKey(key);
    const keyBytes = aesjs.utils.hex.toBytes(encryptionKey);

    // First 32 hex chars = 16-byte IV
    const iv = aesjs.utils.hex.toBytes(value.slice(0, 32));
    const encryptedBytes = aesjs.utils.hex.toBytes(value.slice(32));

    const aesCbc = new aesjs.ModeOfOperation.cbc(keyBytes, iv);
    const decryptedBytes = aesCbc.decrypt(encryptedBytes);
    const unpadded = aesjs.padding.pkcs7.strip(decryptedBytes);
    return aesjs.utils.utf8.fromBytes(unpadded);
  }

  private async _getOrCreateKey(name: string): Promise<string> {
    const existing = await SecureStore.getItemAsync(name);
    if (existing) return existing;

    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const key = aesjs.utils.hex.fromBytes(randomBytes);
    await SecureStore.setItemAsync(name, key);
    return key;
  }

  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    try {
      return await this._decrypt(key, encrypted);
    } catch {
      await AsyncStorage.removeItem(key);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await this._encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: new LargeSecureStore() } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

// Keep session alive when app returns to foreground.
// Without this, tokens expire after ~1 hour of backgrounding.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
