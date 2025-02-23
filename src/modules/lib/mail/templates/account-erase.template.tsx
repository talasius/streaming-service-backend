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

interface AccountEraseTemplateProps {
  domain: string;
}

export function AccountEraseTemplate({ domain }: AccountEraseTemplateProps) {
  const registerLink = `${domain}/account/create`;

  return (
    <Html>
      <Head />
      <Preview>Account delited</Preview>
      <Tailwind>
        <Body className="max-w-2xl mx-auto p-6 bg-slate-50">
          <Section className="text-center">
            <Heading className="text-3xl text-black font-bold">
              Your account has been completely deleted
            </Heading>
            <Text className="text-base text-black">
              Your account has been completely erased from <b>TeaStream</b>. All
              your data and information have been permanently deleted.
            </Text>
          </Section>

          <Section className="bg-white text-black rounded-lg p-6 text-center mb-4">
            <Text>
              You will no longer receive any email or Telegram notifications
              from <b>TeaStream</b>.
            </Text>
            <Text>
              If you want to return to <b>TeaStream</b>, you can do it by
              signing up again:
            </Text>
            <Link
              href={registerLink}
              className="inline-flex justify-center items-center rounded-full mt-2 text-sm font-medium text-white bf-[#18b9ae] px-5 py-2 "
            >
              Sign up to TeaStream
            </Link>
          </Section>

          <Section className="bg-gray-100 rounded-lg p-6 mb-6">
            <Text className="text-center text-black">
              Thank you for your continued support! We are always happy to have
              you here.
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
