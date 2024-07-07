export enum RoomCreationType {
  QUEUE = 'QUEUE',
  CUSTOM_ROOM = 'CUSTOM_ROOM',
}

export function roomCreationTypeStrToMetricLabel(str: string) {
  switch (str) {
    case RoomCreationType.QUEUE:
      return 'matchmaking';
    case RoomCreationType.CUSTOM_ROOM:
      return 'custom';
    default:
      throw new Error(`Unknown RoomCreationType: ${str}`);
  }
}

export function strToRoomCreationType(typeString: string): RoomCreationType {
  switch (typeString) {
    case RoomCreationType.QUEUE:
      return RoomCreationType.QUEUE;
    case RoomCreationType.CUSTOM_ROOM:
      return RoomCreationType.CUSTOM_ROOM;
    default:
      console.warn(`Invalid roomCreationType string. Got ${typeString}`);
      return RoomCreationType.CUSTOM_ROOM;
  }
}
