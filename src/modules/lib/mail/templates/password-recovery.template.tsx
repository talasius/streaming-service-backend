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
interface PasswordRecoveryTemplateProps {
  domain: string;
  token: string;
  metadata: SessionMetadata;
}

export function PasswordRecoveryTemplate({
  domain,
  token,
  metadata,
}: PasswordRecoveryTemplateProps) {
  const resetLink = `${domain}/account/recovery/${token}`;

  return (
    <Html>
      <Head />
      <Preview>Password Recovery</Preview>
      <Tailwind>
        <Body className="max-w-2xl mx-auto p-6 bg-slate-50">
          <Section className="text-center mb-8">
            <Heading className="text-3xl text-black font-bold">
              Password Recovery
            </Heading>
            <Text className="text-base text-black">
              You requested a password recovery for your account.
            </Text>
            <Text className="text-base text-black">
              Click the button below to reset your password:
            </Text>
            <Link
              href={resetLink}
              className="inline-flex justify-center items-center rounded-full text-sm font-medium text-white bg-[#18b9ae] px-5 py-2"
            >
              Reset Password
            </Link>
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
