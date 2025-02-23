import { type DynamicModule, Module } from '@nestjs/common';
import {
  LiveKitOptionsSymbol,
  type TLiveKitAsyncOptions,
  type TLiveKitOptions,
} from './types/livekit.types';
import { LivekitService } from './livekit.service';

@Module({})
export class LivekitModule {
  public static forRoot(options: TLiveKitOptions): DynamicModule {
    return {
      module: LivekitModule,
      providers: [
        { provide: LiveKitOptionsSymbol, useValue: options },
        LivekitService,
      ],
      exports: [LivekitService],
      global: true,
    };
  }

  public static forRootAsync(options: TLiveKitAsyncOptions): DynamicModule {
    return {
      module: LivekitModule,
      imports: options.imports || [],
      providers: [
        {
          provide: LiveKitOptionsSymbol,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        LivekitService,
      ],
      exports: [LivekitService],
      global: true,
    };
  }
}
