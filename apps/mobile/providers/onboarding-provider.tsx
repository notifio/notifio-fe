import { createContext, useCallback, useMemo, useState } from 'react';

export interface OnboardingContextValue {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const completeOnboarding = useCallback(() => setHasCompletedOnboarding(true), []);
  const resetOnboarding = useCallback(() => setHasCompletedOnboarding(false), []);

  const value = useMemo(
    () => ({ hasCompletedOnboarding, completeOnboarding, resetOnboarding }),
    [hasCompletedOnboarding, completeOnboarding, resetOnboarding],
  );

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
}
