import { DownloadButtons } from '@/components/landing/download-buttons';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Text } from '@/components/ui/text';

export function CtaSection() {
  return (
    <Section variant="dark" id="download">
      <AnimateOnScroll className="flex flex-col items-center text-center">
        <Heading as="h2" size="lg">
          Ready to stay informed?
        </Heading>
        <Text size="lg" className="mt-4 max-w-xl text-gray-400">
          Download Notifio and never be caught off guard again.
        </Text>
        <DownloadButtons className="mt-10 justify-center" />
      </AnimateOnScroll>
    </Section>
  );
}
