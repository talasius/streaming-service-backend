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

export function ChannelVerifiedTemplate() {
  return (
    <Html>
      <Head />
      <Preview>Your channel has been verified</Preview>
      <Tailwind>
        <Body className="max-w-2xl mx-auto p-6 bg-slate-50">
          <Section className="text-center mb-8">
            <Heading className="text-3xl text-black font-bold">
              Congratulations! Your channel has been verified!
            </Heading>
            <Text className="text-black text-base mt-2">
              We are glad to inform you that your channel has been successfully
              verified given an official badge
            </Text>
          </Section>
          <Section className="bg-white rounded-lg shadow-md p-6 text-center mb-6">
            <Heading className="text-2xl text-black font-semibold">
              What does it mean?
            </Heading>
            <Text className="text-black text=base mt-2">
              Verification badge gives you more credibility and visibility on
              TeaStream.
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
