import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import * as aesjs from 'aes-js';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

/**
 * LargeSecureStore — Supabase RN pattern, hardened against the cold-start
 * "I have to log in every morning" bug (AUTH-1, audit 30.4.2026).
 *
 * SecureStore has a 2048-byte limit; Supabase sessions exceed that (~2800
 * bytes). An AES-256 key is stored in SecureStore (32 hex chars, well under
 * limit) and the session blob is encrypted with that key in AsyncStorage.
 *
 * Two bugs were silently wiping the session on transient SecureStore reads:
 *
 * 1. `_getOrCreateKey` returned the SAME function from both encrypt and
 *    decrypt paths. When SecureStore.getItemAsync returned null on
 *    cold-start (Keychain not yet ready, iOS lock-screen edge cases on
 *    `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, Android Keystore eviction after
 *    fingerprint enrollment, etc.), a NEW key was generated on the
 *    decrypt path — guaranteeing the next decrypt would produce
 *    garbage, the catch block would fire, and AsyncStorage would get
 *    wiped. We now split the read and write paths: decrypt uses
 *    `_getKey` (read-only) which throws when the key is missing,
 *    bubbling out via getItem's catch as a clean "no session", without
 *    burning a fresh key.
 *
 * 2. `getItem` called `AsyncStorage.removeItem(key)` on any decrypt
 *    error — a transient SecureStore hiccup once was enough to nuke
 *    the session permanently. Drop the wipe; if the key returns later
 *    we can still decrypt, and a real corruption case gets overwritten
 *    by the next setItem during sign-in anyway.
 *
 * Plus: pin the keychain accessibility to `AFTER_FIRST_UNLOCK_THIS_
 * DEVICE_ONLY` so the key survives reboots and is reachable after the
 * first device unlock — the right setting for an always-running RN
 * app, and avoids the boot-time race where a cold-launched app reads
 * SecureStore before the user has unlocked the device.
 */
const KEYCHAIN_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

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
    // Decrypt path is READ-ONLY for the keychain entry. If the key has
    // gone missing the right answer is "we can't recover this blob" —
    // we surface that as a thrown error and let getItem catch it. We
    // must NOT regenerate the key here, otherwise we'd discard the
    // existing session with no chance of recovery.
    const encryptionKey = await this._getKey(key);
    if (!encryptionKey) {
      throw new Error('SecureStore key missing — cannot decrypt');
    }
    const keyBytes = aesjs.utils.hex.toBytes(encryptionKey);

    // First 32 hex chars = 16-byte IV
    const iv = aesjs.utils.hex.toBytes(value.slice(0, 32));
    const encryptedBytes = aesjs.utils.hex.toBytes(value.slice(32));

    const aesCbc = new aesjs.ModeOfOperation.cbc(keyBytes, iv);
    const decryptedBytes = aesCbc.decrypt(encryptedBytes);
    const unpadded = aesjs.padding.pkcs7.strip(decryptedBytes);
    return aesjs.utils.utf8.fromBytes(unpadded);
  }

  private async _getKey(name: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(name, KEYCHAIN_OPTIONS);
    } catch {
      // Treat any keychain access failure as "no key available" — the
      // caller will throw, the session blob is preserved in AsyncStorage,
      // and the next attempt (often after device unlock or a process
      // restart) can recover.
      return null;
    }
  }

  private async _getOrCreateKey(name: string): Promise<string> {
    const existing = await this._getKey(name);
    if (existing) return existing;

    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const key = aesjs.utils.hex.fromBytes(randomBytes);
    await SecureStore.setItemAsync(name, key, KEYCHAIN_OPTIONS);
    return key;
  }

  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    try {
      return await this._decrypt(key, encrypted);
    } catch {
      // Transient decrypt failure (keychain temporarily unavailable,
      // pre-unlock cold start) returns null but PRESERVES the AsyncStorage
      // blob. Once SecureStore is reachable again the same blob decrypts
      // cleanly. A real corruption case gets overwritten the next time
      // setItem runs (e.g. on the next sign-in) — wiping eagerly here was
      // the root cause of "I have to log in every time I open the app".
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
