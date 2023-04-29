export enum roomCreationTypeEnum {
    RANKED_QUEUE = "RANKED_QUEUE",
    UNRANKED_QUEUE = "UNRANKED_QUEUE",
    CUSTOM_ROOM = "CUSTOM_ROOM"
}

export function getRoomTypeFromString(typeString: string): roomCreationTypeEnum {
    const roomCreationType = roomCreationTypeEnum[typeString as keyof typeof roomCreationTypeEnum];
    if (!roomCreationType) {
        throw new Error("Invalid room creation type! New room must be of roomCreationType RANKED_QUEUE, UNRANKED_QUEUE, or CUSTOM_ROOM!");
    }
    return roomCreationType;
}
