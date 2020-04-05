import { google } from './bundle';

export const getProtoTimestamp = () => {
  const timeMS = new Date();
  return google.protobuf.Timestamp.fromObject({
    seconds: timeMS.getTime() / 1000,
    nanos: (timeMS.getTime() % 1000) * 1e6,
  });
};

export const protoTimestampToDate = (timestamp: google.protobuf.ITimestamp) => {
  // JS Date uses milliseconds. Cannot use nanos given in protobuf timestamp.
  const time =
    (timestamp.seconds as number) * 1000 +
    (timestamp.nanos as number) / 1000000;
  return new Date(time);
};
