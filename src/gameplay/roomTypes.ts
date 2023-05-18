export enum roomCreationTypeEnum {
  RANKED_QUEUE = 'RANKED_QUEUE',
  UNRANKED_QUEUE = 'UNRANKED_QUEUE',
  CUSTOM_ROOM = 'CUSTOM_ROOM',
}

export function getRoomTypeFromString(
  typeString: string,
): roomCreationTypeEnum {
  switch (typeString) {
    case roomCreationTypeEnum.RANKED_QUEUE:
      return roomCreationTypeEnum.RANKED_QUEUE;
    case roomCreationTypeEnum.UNRANKED_QUEUE:
      return roomCreationTypeEnum.UNRANKED_QUEUE;
    case roomCreationTypeEnum.CUSTOM_ROOM:
      return roomCreationTypeEnum.CUSTOM_ROOM;
    default:
      throw Error(`Invalid roomCreationType string. Got ${typeString}`);
  }
}
