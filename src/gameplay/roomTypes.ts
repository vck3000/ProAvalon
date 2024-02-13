export enum RoomCreationType {
  RANKED_QUEUE = 'RANKED_QUEUE',
  UNRANKED_QUEUE = 'UNRANKED_QUEUE',
  CUSTOM_ROOM = 'CUSTOM_ROOM',
}

export function strToRoomCreationType(typeString: string): RoomCreationType {
  switch (typeString) {
    case RoomCreationType.RANKED_QUEUE:
      return RoomCreationType.RANKED_QUEUE;
    case RoomCreationType.UNRANKED_QUEUE:
      return RoomCreationType.UNRANKED_QUEUE;
    case RoomCreationType.CUSTOM_ROOM:
      return RoomCreationType.CUSTOM_ROOM;
    default:
      console.warn(`Invalid roomCreationType string. Got ${typeString}`);
      return RoomCreationType.CUSTOM_ROOM;
  }
}
