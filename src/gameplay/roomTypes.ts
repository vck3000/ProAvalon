export enum RoomCreationType {
  QUEUE = 'QUEUE',
  CUSTOM_ROOM = 'CUSTOM_ROOM',
  PRIVATE = 'PRIVATE_ROOM',
}

export function roomCreationTypeStrToMetricLabel(str: string) {
  switch (str) {
    case RoomCreationType.QUEUE:
      return 'matchmaking';
    case RoomCreationType.CUSTOM_ROOM:
      return 'custom';
    case RoomCreationType.PRIVATE:
      return 'private';
    default:
      throw new Error(`Unknown RoomCreationType: ${str}`);
  }
}
