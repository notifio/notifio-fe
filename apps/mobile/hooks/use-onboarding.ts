import { useContext } from 'react';

import { OnboardingContext } from '../providers/onboarding-provider';
import type { OnboardingContextValue } from '../providers/onboarding-provider';

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
