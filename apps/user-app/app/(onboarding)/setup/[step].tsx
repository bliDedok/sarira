import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { OnboardingStepScreen } from '@/features/onboarding/OnboardingStepScreen';

export default function SetupStepPage() {
  const { step } = useLocalSearchParams<{ step?: string }>();
  return <OnboardingStepScreen requestedStep={step ?? ''} />;
}
