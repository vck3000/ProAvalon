export enum RoomCreationType {
  QUEUE = 'QUEUE',
  CUSTOM_ROOM = 'CUSTOM_ROOM',
  PRIVATE = 'PRIVATE_ROOM',
}

export enum RoomCreationMetricType {
  QUEUE = 'matchmaking',
  CUSTOM_ROOM = 'custom',
  PRIVATE = 'private',
}

const roomCreationMapping: {
  [key in RoomCreationType]: RoomCreationMetricType;
} = {
  [RoomCreationType.QUEUE]: RoomCreationMetricType.QUEUE,
  [RoomCreationType.CUSTOM_ROOM]: RoomCreationMetricType.CUSTOM_ROOM,
  [RoomCreationType.PRIVATE]: RoomCreationMetricType.PRIVATE,
};

export function getRoomCreationMetricType(
  type: RoomCreationType,
): RoomCreationMetricType {
  const metricType = roomCreationMapping[type];

  if (!metricType) {
    throw new Error(`Invalid RoomCreationType: ${type}`);
  }

  return roomCreationMapping[type];
}
