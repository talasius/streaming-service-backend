import { type TLiveKitOptions } from '@/src/modules/lib/livekit/types/livekit.types';
import { ConfigService } from '@nestjs/config';

export function getLiveKitConfig(
  configService: ConfigService,
): TLiveKitOptions {
  return {
    apiUrl: configService.getOrThrow<string>('LIVEKIT_API_URL'),
    apiKey: configService.getOrThrow<string>('LIVEKIT_API_KEY'),
    apiSecret: configService.getOrThrow<string>('LIVEKIT_API_SECRET'),
  };
}
