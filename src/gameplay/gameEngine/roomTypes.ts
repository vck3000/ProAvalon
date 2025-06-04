export enum RoomCreationType {
  QUEUE = 'QUEUE',
  CUSTOM_ROOM = 'CUSTOM_ROOM',
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
