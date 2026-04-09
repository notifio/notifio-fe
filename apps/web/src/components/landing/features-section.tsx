'use client';

import { type Icon, IconBarrierBlock, IconBolt, IconCloudStorm, IconMapPin, IconWind } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Text } from '@/components/ui/text';

interface FeatureItem {
  icon: Icon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
}

interface FeatureCardProps {
  feature: FeatureItem;
}

function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <Card hover className="p-6 md:p-8">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: feature.iconBgColor }}
      >
        <Icon size={20} color={feature.iconColor} />
      </div>
      <Heading as="h3" size="sm" className="mt-4">
        {feature.title}
      </Heading>
      <Text size="sm" muted className="mt-2">
        {feature.description}
      </Text>
    </Card>
  );
}

export function FeaturesSection() {
  const t = useTranslations('landing');

  const FEATURES: FeatureItem[] = [
    {
      icon: IconCloudStorm,
      iconColor: '#0EA5E9',
      iconBgColor: '#F0F9FF',
      title: t('features.weather.title'),
      description: t('features.weather.description'),
    },
    {
      icon: IconBarrierBlock,
      iconColor: '#F97316',
      iconBgColor: '#FFF7ED',
      title: t('features.traffic.title'),
      description: t('features.traffic.description'),
    },
    {
      icon: IconWind,
      iconColor: '#10B981',
      iconBgColor: '#ECFDF5',
      title: t('features.airQuality.title'),
      description: t('features.airQuality.description'),
    },
    {
      icon: IconBolt,
      iconColor: '#8B5CF6',
      iconBgColor: '#F5F3FF',
      title: t('features.outages.title'),
      description: t('features.outages.description'),
    },
    {
      icon: IconMapPin,
      iconColor: '#2563EB',
      iconBgColor: '#EFF6FF',
      title: t('features.location.title'),
      description: t('features.location.description'),
    },
  ];

  return (
    <Section variant="light" id="features">
      <AnimateOnScroll className="text-center">
        <Heading as="h2" size="lg">
          {t('features.title')}
        </Heading>
        <Text size="lg" muted className="mx-auto mt-4 max-w-2xl">
          {t('features.subtitle')}
        </Text>
      </AnimateOnScroll>

      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <AnimateOnScroll key={feature.title} delay={index * 100}>
            <FeatureCard feature={feature} />
          </AnimateOnScroll>
        ))}
      </div>
    </Section>
  );
}
