import { redirect } from 'next/navigation';

import { CtaSection } from '@/components/landing/cta-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { Footer } from '@/components/landing/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { getUser } from '@/lib/auth';

export default async function Home() {
  const user = await getUser();
  if (user) redirect('/dashboard');

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
      <Footer />
    </>
  );
}
