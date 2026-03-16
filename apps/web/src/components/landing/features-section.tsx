import { type LucideIcon, CloudLightning, Construction, MapPin, Wind, Zap } from 'lucide-react';

import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Text } from '@/components/ui/text';

interface FeatureItem {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: CloudLightning,
    iconColor: '#0EA5E9',
    iconBgColor: '#F0F9FF',
    title: 'Weather Warnings',
    description:
      'Severe storms, flash floods, extreme heat — get warned before conditions escalate, not after.',
  },
  {
    icon: Construction,
    iconColor: '#F97316',
    iconBgColor: '#FFF7ED',
    title: 'Traffic Updates',
    description:
      'Road closures, accidents, and detours around your location. Skip the gridlock entirely.',
  },
  {
    icon: Wind,
    iconColor: '#10B981',
    iconBgColor: '#ECFDF5',
    title: 'Air Quality',
    description:
      'Real-time AQI monitoring so you know when to keep the windows closed or skip the run.',
  },
  {
    icon: Zap,
    iconColor: '#8B5CF6',
    iconBgColor: '#F5F3FF',
    title: 'Utility Outages',
    description:
      'Power cuts, water disruptions, and planned maintenance — know before the lights go out.',
  },
  {
    icon: MapPin,
    iconColor: '#2563EB',
    iconBgColor: '#EFF6FF',
    title: 'Location-Smart',
    description:
      'Alerts follow you. Move neighborhoods, travel across the country — coverage adapts automatically.',
  },
];

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
  return (
    <Section variant="light" id="features">
      <AnimateOnScroll className="text-center">
        <Heading as="h2" size="lg">
          Everything that matters, in one place
        </Heading>
        <Text size="lg" muted className="mx-auto mt-4 max-w-2xl">
          One app replaces five. Hyperlocal alerts powered by your exact location — no city
          selection, no zip codes.
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
