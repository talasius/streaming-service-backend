import type {
  DeviceInfo,
  LocationInfo,
  SessionMetadata,
} from '@/src/shared/types/session-metadata.types';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LocationModel implements LocationInfo {
  @Field(() => String)
  public country: string;

  @Field(() => String)
  public city: string;

  @Field(() => String)
  public latitude: number;

  @Field(() => String)
  public longitude: number;
}

@ObjectType()
export class DeviceModel implements DeviceInfo {
  @Field(() => String)
  public browser: string;

  @Field(() => String)
  public os: string;

  @Field(() => String)
  public deviceType: string;
}

@ObjectType()
export class SessionMetadataModel implements SessionMetadata {
  @Field(() => LocationModel)
  public location: LocationModel;

  @Field(() => String)
  public ip: string;

  @Field(() => DeviceModel)
  device: DeviceModel;
}

@ObjectType()
export class SessionModel {
  @Field(() => ID)
  public id: string;

  @Field(() => String)
  public userId: string;

  @Field(() => String)
  createdAt: string;

  @Field(() => SessionMetadataModel)
  metadata: SessionMetadataModel;
}
