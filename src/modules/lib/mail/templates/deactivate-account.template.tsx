import type { SessionMetadata } from '@/src/shared/types/session-metadata.types';
import {
  Body,
  Head,
  Heading,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { Html } from '@react-email/html';
import * as React from 'react';

interface DeactivateAccountTemplateProps {
  token: string;
  metadata: SessionMetadata;
}

export function DeactivateAccountTemplate({
  token,
  metadata,
}: DeactivateAccountTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Account Deactivation</Preview>
      <Tailwind>
        <Body className="max-w-2xl mx-auto p-6 bg-slate-50">
          <Section className="text-center mb-8">
            <Heading className="text-3xl text-black font-bold">
              Account Deactivation Request
            </Heading>
            <Text className="text-base text-black">
              You initiated a request to deactivate your account on{' '}
              <b>Teastream</b>.
            </Text>
          </Section>

          <Section className="bg-gray-100 rounded-lg p-6 text-center mb-6">
            <Heading className="text-2xl text-black font-semibold">
              Confirmation code:
            </Heading>
            <Heading className="text-3xl text-black font-semibold">
              {token}
            </Heading>
            <Text className="text-black">
              This code is valid for 5 minutes.
            </Text>
          </Section>

          <Section className="bg-gray-100 rounded-lg p-6 mb-6">
            <Heading className="text-xl font-semibold text-[#18b9ae]">
              Request information:
            </Heading>
            <ul className="list-disc list-inside mt-2 text-black">
              <li>🌍 Location: {metadata.location.country}</li>
              <li>📱 Operating system: {metadata.device.os}</li>
              <li>🌐 Browser: {metadata.device.browser}</li>
              <li>💻 IP address: {metadata.ip}</li>
            </ul>
            <Text className="text-gray-600 mt-2">
              If you haven&apos;t made this request, please ignore this email.
            </Text>
          </Section>

          <Section className="text-center mt-8">
            <Text className="text-gray-600">
              Have any questions left? Feel free to reach out to us at{' '}
              <Link
                href="mailto:help@teastream.ru"
                className="text-[#18b9ae] underline"
              >
                help@teastream.ru
              </Link>
            </Text>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}
