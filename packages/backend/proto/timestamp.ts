import { google } from './bundle';

export const getProtoTimestamp = () => {
  const timeMS = Date.now();
  return google.protobuf.Timestamp.fromObject({
    seconds: timeMS / 1000,
    nanos: (timeMS % 1000) * 1e6,
  });
};

export const protoTimestampToDate = (timestamp: google.protobuf.ITimestamp) => {
  // JS Date uses milliseconds. Cannot use nanos given in protobuf timestamp.
  const time = (timestamp.seconds as number) * 1000;
  return new Date(time);
};
