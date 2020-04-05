/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.ChatRequest = (function() {

    /**
     * Properties of a ChatRequest.
     * @exports IChatRequest
     * @interface IChatRequest
     * @property {string} text ChatRequest text
     */

    /**
     * Constructs a new ChatRequest.
     * @exports ChatRequest
     * @classdesc Represents a ChatRequest.
     * @implements IChatRequest
     * @constructor
     * @param {IChatRequest=} [properties] Properties to set
     */
    function ChatRequest(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ChatRequest text.
     * @member {string} text
     * @memberof ChatRequest
     * @instance
     */
    ChatRequest.prototype.text = "";

    /**
     * Creates a new ChatRequest instance using the specified properties.
     * @function create
     * @memberof ChatRequest
     * @static
     * @param {IChatRequest=} [properties] Properties to set
     * @returns {ChatRequest} ChatRequest instance
     */
    ChatRequest.create = function create(properties) {
        return new ChatRequest(properties);
    };

    /**
     * Encodes the specified ChatRequest message. Does not implicitly {@link ChatRequest.verify|verify} messages.
     * @function encode
     * @memberof ChatRequest
     * @static
     * @param {IChatRequest} message ChatRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChatRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        writer.uint32(/* id 1, wireType 2 =*/10).string(message.text);
        return writer;
    };

    /**
     * Encodes the specified ChatRequest message, length delimited. Does not implicitly {@link ChatRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ChatRequest
     * @static
     * @param {IChatRequest} message ChatRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChatRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ChatRequest message from the specified reader or buffer.
     * @function decode
     * @memberof ChatRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ChatRequest} ChatRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChatRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChatRequest();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.text = reader.string();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        if (!message.hasOwnProperty("text"))
            throw $util.ProtocolError("missing required 'text'", { instance: message });
        return message;
    };

    /**
     * Decodes a ChatRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ChatRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ChatRequest} ChatRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChatRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ChatRequest message.
     * @function verify
     * @memberof ChatRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ChatRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (!$util.isString(message.text))
            return "text: string expected";
        return null;
    };

    /**
     * Creates a ChatRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ChatRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ChatRequest} ChatRequest
     */
    ChatRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.ChatRequest)
            return object;
        var message = new $root.ChatRequest();
        if (object.text != null)
            message.text = String(object.text);
        return message;
    };

    /**
     * Creates a plain object from a ChatRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ChatRequest
     * @static
     * @param {ChatRequest} message ChatRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ChatRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults)
            object.text = "";
        if (message.text != null && message.hasOwnProperty("text"))
            object.text = message.text;
        return object;
    };

    /**
     * Converts this ChatRequest to JSON.
     * @function toJSON
     * @memberof ChatRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ChatRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return ChatRequest;
})();

$root.ChatResponse = (function() {

    /**
     * Properties of a ChatResponse.
     * @exports IChatResponse
     * @interface IChatResponse
     * @property {string} text ChatResponse text
     * @property {string} username ChatResponse username
     * @property {google.protobuf.ITimestamp} timestamp ChatResponse timestamp
     * @property {ChatResponse.ChatResponseType} type ChatResponse type
     */

    /**
     * Constructs a new ChatResponse.
     * @exports ChatResponse
     * @classdesc Represents a ChatResponse.
     * @implements IChatResponse
     * @constructor
     * @param {IChatResponse=} [properties] Properties to set
     */
    function ChatResponse(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ChatResponse text.
     * @member {string} text
     * @memberof ChatResponse
     * @instance
     */
    ChatResponse.prototype.text = "";

    /**
     * ChatResponse username.
     * @member {string} username
     * @memberof ChatResponse
     * @instance
     */
    ChatResponse.prototype.username = "";

    /**
     * ChatResponse timestamp.
     * @member {google.protobuf.ITimestamp} timestamp
     * @memberof ChatResponse
     * @instance
     */
    ChatResponse.prototype.timestamp = null;

    /**
     * ChatResponse type.
     * @member {ChatResponse.ChatResponseType} type
     * @memberof ChatResponse
     * @instance
     */
    ChatResponse.prototype.type = 0;

    /**
     * Creates a new ChatResponse instance using the specified properties.
     * @function create
     * @memberof ChatResponse
     * @static
     * @param {IChatResponse=} [properties] Properties to set
     * @returns {ChatResponse} ChatResponse instance
     */
    ChatResponse.create = function create(properties) {
        return new ChatResponse(properties);
    };

    /**
     * Encodes the specified ChatResponse message. Does not implicitly {@link ChatResponse.verify|verify} messages.
     * @function encode
     * @memberof ChatResponse
     * @static
     * @param {IChatResponse} message ChatResponse message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChatResponse.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        writer.uint32(/* id 1, wireType 2 =*/10).string(message.text);
        writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
        $root.google.protobuf.Timestamp.encode(message.timestamp, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        writer.uint32(/* id 4, wireType 0 =*/32).int32(message.type);
        return writer;
    };

    /**
     * Encodes the specified ChatResponse message, length delimited. Does not implicitly {@link ChatResponse.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ChatResponse
     * @static
     * @param {IChatResponse} message ChatResponse message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChatResponse.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ChatResponse message from the specified reader or buffer.
     * @function decode
     * @memberof ChatResponse
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ChatResponse} ChatResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChatResponse.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChatResponse();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.text = reader.string();
                break;
            case 2:
                message.username = reader.string();
                break;
            case 3:
                message.timestamp = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                break;
            case 4:
                message.type = reader.int32();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        if (!message.hasOwnProperty("text"))
            throw $util.ProtocolError("missing required 'text'", { instance: message });
        if (!message.hasOwnProperty("username"))
            throw $util.ProtocolError("missing required 'username'", { instance: message });
        if (!message.hasOwnProperty("timestamp"))
            throw $util.ProtocolError("missing required 'timestamp'", { instance: message });
        if (!message.hasOwnProperty("type"))
            throw $util.ProtocolError("missing required 'type'", { instance: message });
        return message;
    };

    /**
     * Decodes a ChatResponse message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ChatResponse
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ChatResponse} ChatResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChatResponse.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ChatResponse message.
     * @function verify
     * @memberof ChatResponse
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ChatResponse.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (!$util.isString(message.text))
            return "text: string expected";
        if (!$util.isString(message.username))
            return "username: string expected";
        {
            var error = $root.google.protobuf.Timestamp.verify(message.timestamp);
            if (error)
                return "timestamp." + error;
        }
        switch (message.type) {
        default:
            return "type: enum value expected";
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            break;
        }
        return null;
    };

    /**
     * Creates a ChatResponse message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ChatResponse
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ChatResponse} ChatResponse
     */
    ChatResponse.fromObject = function fromObject(object) {
        if (object instanceof $root.ChatResponse)
            return object;
        var message = new $root.ChatResponse();
        if (object.text != null)
            message.text = String(object.text);
        if (object.username != null)
            message.username = String(object.username);
        if (object.timestamp != null) {
            if (typeof object.timestamp !== "object")
                throw TypeError(".ChatResponse.timestamp: object expected");
            message.timestamp = $root.google.protobuf.Timestamp.fromObject(object.timestamp);
        }
        switch (object.type) {
        case "CHAT":
        case 0:
            message.type = 0;
            break;
        case "RES_WIN":
        case 1:
            message.type = 1;
            break;
        case "SPY_WIN":
        case 2:
            message.type = 2;
            break;
        case "PLAYER_JOIN_LOBBY":
        case 3:
            message.type = 3;
            break;
        case "PLAYER_LEAVE_LOBBY":
        case 4:
            message.type = 4;
            break;
        case "CREATE_ROOM":
        case 5:
            message.type = 5;
            break;
        }
        return message;
    };

    /**
     * Creates a plain object from a ChatResponse message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ChatResponse
     * @static
     * @param {ChatResponse} message ChatResponse
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ChatResponse.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.text = "";
            object.username = "";
            object.timestamp = null;
            object.type = options.enums === String ? "CHAT" : 0;
        }
        if (message.text != null && message.hasOwnProperty("text"))
            object.text = message.text;
        if (message.username != null && message.hasOwnProperty("username"))
            object.username = message.username;
        if (message.timestamp != null && message.hasOwnProperty("timestamp"))
            object.timestamp = $root.google.protobuf.Timestamp.toObject(message.timestamp, options);
        if (message.type != null && message.hasOwnProperty("type"))
            object.type = options.enums === String ? $root.ChatResponse.ChatResponseType[message.type] : message.type;
        return object;
    };

    /**
     * Converts this ChatResponse to JSON.
     * @function toJSON
     * @memberof ChatResponse
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ChatResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * ChatResponseType enum.
     * @name ChatResponse.ChatResponseType
     * @enum {string}
     * @property {number} CHAT=0 CHAT value
     * @property {number} RES_WIN=1 RES_WIN value
     * @property {number} SPY_WIN=2 SPY_WIN value
     * @property {number} PLAYER_JOIN_LOBBY=3 PLAYER_JOIN_LOBBY value
     * @property {number} PLAYER_LEAVE_LOBBY=4 PLAYER_LEAVE_LOBBY value
     * @property {number} CREATE_ROOM=5 CREATE_ROOM value
     */
    ChatResponse.ChatResponseType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "CHAT"] = 0;
        values[valuesById[1] = "RES_WIN"] = 1;
        values[valuesById[2] = "SPY_WIN"] = 2;
        values[valuesById[3] = "PLAYER_JOIN_LOBBY"] = 3;
        values[valuesById[4] = "PLAYER_LEAVE_LOBBY"] = 4;
        values[valuesById[5] = "CREATE_ROOM"] = 5;
        return values;
    })();

    return ChatResponse;
})();

$root.ChatResponses = (function() {

    /**
     * Properties of a ChatResponses.
     * @exports IChatResponses
     * @interface IChatResponses
     * @property {Array.<IChatResponse>|null} [chatResponses] ChatResponses chatResponses
     */

    /**
     * Constructs a new ChatResponses.
     * @exports ChatResponses
     * @classdesc Represents a ChatResponses.
     * @implements IChatResponses
     * @constructor
     * @param {IChatResponses=} [properties] Properties to set
     */
    function ChatResponses(properties) {
        this.chatResponses = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ChatResponses chatResponses.
     * @member {Array.<IChatResponse>} chatResponses
     * @memberof ChatResponses
     * @instance
     */
    ChatResponses.prototype.chatResponses = $util.emptyArray;

    /**
     * Creates a new ChatResponses instance using the specified properties.
     * @function create
     * @memberof ChatResponses
     * @static
     * @param {IChatResponses=} [properties] Properties to set
     * @returns {ChatResponses} ChatResponses instance
     */
    ChatResponses.create = function create(properties) {
        return new ChatResponses(properties);
    };

    /**
     * Encodes the specified ChatResponses message. Does not implicitly {@link ChatResponses.verify|verify} messages.
     * @function encode
     * @memberof ChatResponses
     * @static
     * @param {IChatResponses} message ChatResponses message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChatResponses.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.chatResponses != null && message.chatResponses.length)
            for (var i = 0; i < message.chatResponses.length; ++i)
                $root.ChatResponse.encode(message.chatResponses[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified ChatResponses message, length delimited. Does not implicitly {@link ChatResponses.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ChatResponses
     * @static
     * @param {IChatResponses} message ChatResponses message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChatResponses.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ChatResponses message from the specified reader or buffer.
     * @function decode
     * @memberof ChatResponses
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ChatResponses} ChatResponses
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChatResponses.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChatResponses();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                if (!(message.chatResponses && message.chatResponses.length))
                    message.chatResponses = [];
                message.chatResponses.push($root.ChatResponse.decode(reader, reader.uint32()));
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a ChatResponses message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ChatResponses
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ChatResponses} ChatResponses
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChatResponses.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ChatResponses message.
     * @function verify
     * @memberof ChatResponses
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ChatResponses.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.chatResponses != null && message.hasOwnProperty("chatResponses")) {
            if (!Array.isArray(message.chatResponses))
                return "chatResponses: array expected";
            for (var i = 0; i < message.chatResponses.length; ++i) {
                var error = $root.ChatResponse.verify(message.chatResponses[i]);
                if (error)
                    return "chatResponses." + error;
            }
        }
        return null;
    };

    /**
     * Creates a ChatResponses message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ChatResponses
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ChatResponses} ChatResponses
     */
    ChatResponses.fromObject = function fromObject(object) {
        if (object instanceof $root.ChatResponses)
            return object;
        var message = new $root.ChatResponses();
        if (object.chatResponses) {
            if (!Array.isArray(object.chatResponses))
                throw TypeError(".ChatResponses.chatResponses: array expected");
            message.chatResponses = [];
            for (var i = 0; i < object.chatResponses.length; ++i) {
                if (typeof object.chatResponses[i] !== "object")
                    throw TypeError(".ChatResponses.chatResponses: object expected");
                message.chatResponses[i] = $root.ChatResponse.fromObject(object.chatResponses[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a ChatResponses message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ChatResponses
     * @static
     * @param {ChatResponses} message ChatResponses
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ChatResponses.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.chatResponses = [];
        if (message.chatResponses && message.chatResponses.length) {
            object.chatResponses = [];
            for (var j = 0; j < message.chatResponses.length; ++j)
                object.chatResponses[j] = $root.ChatResponse.toObject(message.chatResponses[j], options);
        }
        return object;
    };

    /**
     * Converts this ChatResponses to JSON.
     * @function toJSON
     * @memberof ChatResponses
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ChatResponses.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return ChatResponses;
})();

$root.google = (function() {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    var google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        var protobuf = {};

        protobuf.Timestamp = (function() {

            /**
             * Properties of a Timestamp.
             * @memberof google.protobuf
             * @interface ITimestamp
             * @property {number|Long|null} [seconds] Timestamp seconds
             * @property {number|null} [nanos] Timestamp nanos
             */

            /**
             * Constructs a new Timestamp.
             * @memberof google.protobuf
             * @classdesc Represents a Timestamp.
             * @implements ITimestamp
             * @constructor
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             */
            function Timestamp(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Timestamp seconds.
             * @member {number|Long} seconds
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.seconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Timestamp nanos.
             * @member {number} nanos
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.nanos = 0;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             * @returns {google.protobuf.Timestamp} Timestamp instance
             */
            Timestamp.create = function create(properties) {
                return new Timestamp(properties);
            };

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.seconds);
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.nanos);
                return writer;
            };

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Timestamp();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.seconds = reader.int64();
                        break;
                    case 2:
                        message.nanos = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Timestamp message.
             * @function verify
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Timestamp.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (!$util.isInteger(message.seconds) && !(message.seconds && $util.isInteger(message.seconds.low) && $util.isInteger(message.seconds.high)))
                        return "seconds: integer|Long expected";
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    if (!$util.isInteger(message.nanos))
                        return "nanos: integer expected";
                return null;
            };

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Timestamp} Timestamp
             */
            Timestamp.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Timestamp)
                    return object;
                var message = new $root.google.protobuf.Timestamp();
                if (object.seconds != null)
                    if ($util.Long)
                        (message.seconds = $util.Long.fromValue(object.seconds)).unsigned = false;
                    else if (typeof object.seconds === "string")
                        message.seconds = parseInt(object.seconds, 10);
                    else if (typeof object.seconds === "number")
                        message.seconds = object.seconds;
                    else if (typeof object.seconds === "object")
                        message.seconds = new $util.LongBits(object.seconds.low >>> 0, object.seconds.high >>> 0).toNumber();
                if (object.nanos != null)
                    message.nanos = object.nanos | 0;
                return message;
            };

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.Timestamp} message Timestamp
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Timestamp.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.seconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seconds = options.longs === String ? "0" : 0;
                    object.nanos = 0;
                }
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (typeof message.seconds === "number")
                        object.seconds = options.longs === String ? String(message.seconds) : message.seconds;
                    else
                        object.seconds = options.longs === String ? $util.Long.prototype.toString.call(message.seconds) : options.longs === Number ? new $util.LongBits(message.seconds.low >>> 0, message.seconds.high >>> 0).toNumber() : message.seconds;
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    object.nanos = message.nanos;
                return object;
            };

            /**
             * Converts this Timestamp to JSON.
             * @function toJSON
             * @memberof google.protobuf.Timestamp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Timestamp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Timestamp;
        })();

        return protobuf;
    })();

    return google;
})();

module.exports = $root;
