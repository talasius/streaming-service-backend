import { Inject, Injectable } from '@nestjs/common';
import {
  IngressClient,
  RoomServiceClient,
  WebhookReceiver,
} from 'livekit-server-sdk';
import {
  LiveKitOptionsSymbol,
  type TLiveKitOptions,
} from './types/livekit.types';

@Injectable()
export class LivekitService {
  private roomService: RoomServiceClient;
  private ingressClient: IngressClient;
  private webhookReciever: WebhookReceiver;

  public constructor(
    @Inject(LiveKitOptionsSymbol) private readonly options: TLiveKitOptions,
  ) {
    this.roomService = new RoomServiceClient(
      this.options.apiUrl,
      this.options.apiKey,
      this.options.apiSecret,
    );
    this.ingressClient = new IngressClient(this.options.apiUrl);
    this.webhookReciever = new WebhookReceiver(
      this.options.apiKey,
      this.options.apiSecret,
    );
  }

  public get ingress(): IngressClient {
    return this.createProxy(this.ingressClient);
  }

  public get room(): RoomServiceClient {
    return this.createProxy(this.roomService);
  }

  public get reciever(): WebhookReceiver {
    return this.createProxy(this.webhookReciever);
  }

  private createProxy<T extends object>(target: T) {
    return new Proxy(target, {
      get: (obj, prop) => {
        const value = obj[prop as keyof T];

        if (typeof value === 'function') {
          return value.bind(obj);
        }

        return value;
      },
    });
  }
}
