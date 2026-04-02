import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

const ONBOARDING_KEY = 'notifio_onboarding_completed';

export interface OnboardingContextValue {
  hasCompletedOnboarding: boolean;
  isOnboardingLoaded: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isOnboardingLoaded, setIsOnboardingLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setHasCompletedOnboarding(value === 'true');
      setIsOnboardingLoaded(true);
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
    AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  }, []);

  const resetOnboarding = useCallback(() => {
    setHasCompletedOnboarding(false);
    AsyncStorage.removeItem(ONBOARDING_KEY);
  }, []);

  const value = useMemo(
    () => ({ hasCompletedOnboarding, isOnboardingLoaded, completeOnboarding, resetOnboarding }),
    [hasCompletedOnboarding, isOnboardingLoaded, completeOnboarding, resetOnboarding],
  );

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
}
