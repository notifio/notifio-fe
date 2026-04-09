'use client';

import { useTranslations } from 'next-intl';

import { DownloadButtons } from '@/components/landing/download-buttons';
import { Navbar } from '@/components/landing/navbar';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Text } from '@/components/ui/text';

const HEXAGON_PATH = 'M50 0L93.3 25V75L50 100L6.7 75V25Z';

const HERO_RINGS = [
  { size: 280, opacity: 'opacity-[0.07]', delay: '0s' },
  { size: 420, opacity: 'opacity-[0.05]', delay: '1s' },
  { size: 560, opacity: 'opacity-[0.03]', delay: '2s' },
] as const;

function HexagonVisual() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      {HERO_RINGS.map((ring) => (
        <svg
          key={ring.size}
          width={ring.size}
          height={ring.size}
          viewBox="0 0 100 100"
          className={`absolute ${ring.opacity} animate-hex-pulse`}
          style={{ animationDelay: ring.delay }}
        >
          <path
            d={HEXAGON_PATH}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </svg>
      ))}

      <div className="animate-hex-rotate absolute h-[700px] w-[700px] opacity-[0.04]">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <path d={HEXAGON_PATH} fill="none" stroke="currentColor" strokeWidth="0.3" />
        </svg>
      </div>

      <div className="animate-hex-float absolute">
        <svg width="64" height="64" viewBox="0 0 100 100" className="opacity-20">
          <defs>
            <linearGradient id="hex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          <path d={HEXAGON_PATH} fill="url(#hex-grad)" />
        </svg>
      </div>
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations('landing');
  return (
    <Section variant="dark" className="relative min-h-[85vh] overflow-hidden pb-32 pt-8 md:pb-40 md:pt-10">
      <Navbar />
      <HexagonVisual />

      <div className="relative z-10 mt-24 max-w-3xl md:mt-32">
        <AnimateOnScroll>
          <Heading as="h1" size="xl">
            {t('hero.title')}
          </Heading>
        </AnimateOnScroll>

        <AnimateOnScroll delay={150}>
          <Text size="lg" className="mt-6 max-w-xl text-white/60">
            {t('hero.subtitle')}
          </Text>
        </AnimateOnScroll>

        <AnimateOnScroll delay={300}>
          <DownloadButtons className="mt-10" />
        </AnimateOnScroll>
      </div>
    </Section>
  );
}
