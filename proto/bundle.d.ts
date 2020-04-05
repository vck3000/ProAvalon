import * as $protobuf from "protobufjs";
/** Properties of a ChatRequest. */
export interface IChatRequest {

    /** ChatRequest text */
    text: string;
}

/** Represents a ChatRequest. */
export class ChatRequest implements IChatRequest {

    /**
     * Constructs a new ChatRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: IChatRequest);

    /** ChatRequest text. */
    public text: string;

    /**
     * Creates a new ChatRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ChatRequest instance
     */
    public static create(properties?: IChatRequest): ChatRequest;

    /**
     * Encodes the specified ChatRequest message. Does not implicitly {@link ChatRequest.verify|verify} messages.
     * @param message ChatRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IChatRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ChatRequest message, length delimited. Does not implicitly {@link ChatRequest.verify|verify} messages.
     * @param message ChatRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IChatRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ChatRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ChatRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ChatRequest;

    /**
     * Decodes a ChatRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ChatRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ChatRequest;

    /**
     * Verifies a ChatRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ChatRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ChatRequest
     */
    public static fromObject(object: { [k: string]: any }): ChatRequest;

    /**
     * Creates a plain object from a ChatRequest message. Also converts values to other types if specified.
     * @param message ChatRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ChatRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ChatRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a ChatResponse. */
export interface IChatResponse {

    /** ChatResponse text */
    text: string;

    /** ChatResponse username */
    username: string;

    /** ChatResponse timestamp */
    timestamp: google.protobuf.ITimestamp;

    /** ChatResponse type */
    type: ChatResponse.ChatResponseType;
}

/** Represents a ChatResponse. */
export class ChatResponse implements IChatResponse {

    /**
     * Constructs a new ChatResponse.
     * @param [properties] Properties to set
     */
    constructor(properties?: IChatResponse);

    /** ChatResponse text. */
    public text: string;

    /** ChatResponse username. */
    public username: string;

    /** ChatResponse timestamp. */
    public timestamp: google.protobuf.ITimestamp;

    /** ChatResponse type. */
    public type: ChatResponse.ChatResponseType;

    /**
     * Creates a new ChatResponse instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ChatResponse instance
     */
    public static create(properties?: IChatResponse): ChatResponse;

    /**
     * Encodes the specified ChatResponse message. Does not implicitly {@link ChatResponse.verify|verify} messages.
     * @param message ChatResponse message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IChatResponse, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ChatResponse message, length delimited. Does not implicitly {@link ChatResponse.verify|verify} messages.
     * @param message ChatResponse message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IChatResponse, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ChatResponse message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ChatResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ChatResponse;

    /**
     * Decodes a ChatResponse message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ChatResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ChatResponse;

    /**
     * Verifies a ChatResponse message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ChatResponse message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ChatResponse
     */
    public static fromObject(object: { [k: string]: any }): ChatResponse;

    /**
     * Creates a plain object from a ChatResponse message. Also converts values to other types if specified.
     * @param message ChatResponse
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ChatResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ChatResponse to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

export namespace ChatResponse {

    /** ChatResponseType enum. */
    enum ChatResponseType {
        CHAT = 0,
        RES_WIN = 1,
        SPY_WIN = 2,
        PLAYER_JOIN_LOBBY = 3,
        PLAYER_LEAVE_LOBBY = 4,
        CREATE_ROOM = 5
    }
}

/** Properties of a ChatResponses. */
export interface IChatResponses {

    /** ChatResponses chatResponses */
    chatResponses?: (IChatResponse[]|null);
}

/** Represents a ChatResponses. */
export class ChatResponses implements IChatResponses {

    /**
     * Constructs a new ChatResponses.
     * @param [properties] Properties to set
     */
    constructor(properties?: IChatResponses);

    /** ChatResponses chatResponses. */
    public chatResponses: IChatResponse[];

    /**
     * Creates a new ChatResponses instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ChatResponses instance
     */
    public static create(properties?: IChatResponses): ChatResponses;

    /**
     * Encodes the specified ChatResponses message. Does not implicitly {@link ChatResponses.verify|verify} messages.
     * @param message ChatResponses message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IChatResponses, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ChatResponses message, length delimited. Does not implicitly {@link ChatResponses.verify|verify} messages.
     * @param message ChatResponses message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IChatResponses, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ChatResponses message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ChatResponses
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ChatResponses;

    /**
     * Decodes a ChatResponses message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ChatResponses
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ChatResponses;

    /**
     * Verifies a ChatResponses message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ChatResponses message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ChatResponses
     */
    public static fromObject(object: { [k: string]: any }): ChatResponses;

    /**
     * Creates a plain object from a ChatResponses message. Also converts values to other types if specified.
     * @param message ChatResponses
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ChatResponses, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ChatResponses to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of a Timestamp. */
        interface ITimestamp {

            /** Timestamp seconds */
            seconds?: (number|Long|null);

            /** Timestamp nanos */
            nanos?: (number|null);
        }

        /** Represents a Timestamp. */
        class Timestamp implements ITimestamp {

            /**
             * Constructs a new Timestamp.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.ITimestamp);

            /** Timestamp seconds. */
            public seconds: (number|Long);

            /** Timestamp nanos. */
            public nanos: number;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Timestamp instance
             */
            public static create(properties?: google.protobuf.ITimestamp): google.protobuf.Timestamp;

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Timestamp;

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Timestamp;

            /**
             * Verifies a Timestamp message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Timestamp
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Timestamp;

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @param message Timestamp
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Timestamp to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}
