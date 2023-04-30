export enum roomCreationTypeEnum {
  RANKED_QUEUE = "RANKED_QUEUE",
  UNRANKED_QUEUE = "UNRANKED_QUEUE",
  CUSTOM_ROOM = "CUSTOM_ROOM"
}

export function getRoomTypeFromString(typeString: string): roomCreationTypeEnum {
  const roomCreationType = roomCreationTypeEnum[typeString as keyof typeof roomCreationTypeEnum];
  let roomTypes = '';
  Object.values(roomCreationTypeEnum).forEach(roomType => roomTypes+=`${roomType}\n`);
  if (!roomCreationType) {
    throw new Error(`Invalid room creation type! Got ${typeString}, expected RoomCreationTypeEnum. Valid values are:\n${roomTypes}`);
  }
  return roomCreationType;
}
