'use client';

import { useTranslations } from 'next-intl';

import { DownloadButtons } from '@/components/landing/download-buttons';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Text } from '@/components/ui/text';

export function CtaSection() {
  const t = useTranslations('landing');
  return (
    <Section variant="dark" id="download">
      <AnimateOnScroll className="flex flex-col items-center text-center">
        <Heading as="h2" size="lg">
          {t('cta.title')}
        </Heading>
        <Text size="lg" className="mt-4 max-w-xl text-white/60">
          {t('cta.subtitle')}
        </Text>
        <DownloadButtons className="mt-10 justify-center" />
      </AnimateOnScroll>
    </Section>
  );
}
