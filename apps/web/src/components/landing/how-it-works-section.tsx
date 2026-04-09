'use client';

import { useTranslations } from 'next-intl';

import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Text } from '@/components/ui/text';

interface StepItem {
  number: number;
  title: string;
  description: string;
}

interface StepCardProps {
  step: StepItem;
  isLast: boolean;
}

function StepCard({ step, isLast }: StepCardProps) {
  return (
    <div className="relative flex flex-1 flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-bold text-white">
        {step.number}
      </div>

      {!isLast && (
        <div
          aria-hidden
          className="absolute left-[calc(50%+2rem)] top-7 hidden h-px w-[calc(100%-4rem)] bg-border lg:block"
        />
      )}

      <Heading as="h3" size="sm" className="mt-6">
        {step.title}
      </Heading>
      <Text size="sm" muted className="mt-2 max-w-xs">
        {step.description}
      </Text>
    </div>
  );
}

export function HowItWorksSection() {
  const t = useTranslations('landing');

  const STEPS: StepItem[] = [
    {
      number: 1,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
    },
    {
      number: 2,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
    },
    {
      number: 3,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
    },
  ];

  return (
    <Section variant="accent" id="how-it-works">
      <AnimateOnScroll className="text-center">
        <Heading as="h2" size="lg">
          {t('howItWorks.title')}
        </Heading>
        <Text size="lg" muted className="mx-auto mt-4 max-w-2xl">
          {t('howItWorks.subtitle')}
        </Text>
      </AnimateOnScroll>

      <div className="mt-16 flex flex-col gap-12 lg:flex-row lg:gap-8">
        {STEPS.map((step, index) => (
          <AnimateOnScroll key={step.number} delay={index * 150} className="flex-1">
            <StepCard step={step} isLast={index === STEPS.length - 1} />
          </AnimateOnScroll>
        ))}
      </div>
    </Section>
  );
}
