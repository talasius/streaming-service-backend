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

interface EnableTwoFactorTemplateProps {
  domain: string;
}

export function EnableTwoFactorTemplate({
  domain,
}: EnableTwoFactorTemplateProps) {
  const settingLink = `${domain}/dashboard/settings`;
  return (
    <Html>
      <Head />
      <Preview>Secure your account!</Preview>
      <Tailwind>
        <Body className="max-w-2xl mx-auto p-6 bg-slate-50">
          <Section className="text-center mb-8">
            <Heading className="text-3xl text-black font-bold">
              Secure your account with two-factor authentication!
            </Heading>
            <Text className="text-black text-base mt-2">
              Enable two-factor authentication to enhance your account security.
            </Text>
          </Section>
          <Section className="bg-white rounded-lg shadow-md p-6 text-center mb-6">
            <Heading className="text-2xl text-black font-semibold">
              Why is it important?
            </Heading>
            <Text className="text-black text=base mt-2">
              Two-factor authentication adds an extra layer of security to your
              account. It requires a second verification step, such as a code
              from your phone, in addition to your password.
            </Text>
            <Link
              href={settingLink}
              className="inline-flex justify-center itemms-center rounded-md text-sm font-medium text-white bg-[#18b9ae] px-5 py-2"
            >
              Account settings
            </Link>
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
