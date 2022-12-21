import { Quote, Message, MessageWithDate } from '../quote';

describe('Quote', () => {
  it('should say a new message is not a quote.', () => {
    // Setup
    const quote = new Quote();

    const message: MessageWithDate = {
      message: 'Hello!',
      username: 'cin333',
      date: new Date(),
    };

    // Trigger...

    // Assert
    expect(quote.augmentIntoQuote(message, 'allchat')).toEqual(false);
  });

  it('should say a message is a quote for a previously seen message.', () => {
    const quote = new Quote();

    const message: MessageWithDate = {
      message: 'Hello!',
      username: 'cin333',
      date: new Date(),
    };

    quote.addMessage(message, 'allchat');

    const messageWithoutDate: Message = {
      message: 'Hello!',
      username: 'cin333',
    };

    expect(quote.augmentIntoQuote(messageWithoutDate, 'allchat')).toEqual(
      message,
    );
  });

  it('should say a message is not a quote for a previously seen message in a different room.', () => {
    const quote = new Quote();

    const message: MessageWithDate = {
      message: 'Hello!',
      username: 'cin333',
      date: new Date(),
    };

    quote.addMessage(message, 'allchat');

    expect(quote.augmentIntoQuote(message, 0)).toEqual(false);
  });

  it('should refresh room chat upon deletion', () => {
    const quote = new Quote();

    const message: MessageWithDate = {
      message: 'Hello!',
      username: 'cin333',
      date: new Date(),
    };

    const messageWithoutDate: Message = {
      message: 'Hello!',
      username: 'cin333',
    };

    quote.addMessage(message, 'allchat');
    expect(quote.augmentIntoQuote(messageWithoutDate, 'allchat')).toEqual(
      message,
    );

    quote.deleteRoomMessages('allchat');
    expect(quote.augmentIntoQuote(messageWithoutDate, 'allchat')).toEqual(
      false,
    );
  });

  it('should deconstruct multiple messages into separate messages', () => {
    const quote = new Quote();

    // Setup
    const data =
      '[14:11] rio: After 3.1 imo [14:11] thechessone D: rio come play [14:11] rio: 3.1 is kinda merlinunt rio: asdf [14:11] rio: yolo   | After 3.1 imo';

    const expectedMessages: Message[] = [
      {
        message: 'After 3.1 imo',
        username: 'rio',
      },
      {
        message: 'rio come play',
        username: 'thechessone',
      },
      {
        message: '3.1 is kinda merlinunt rio: asdf',
        username: 'rio',
      },
      {
        message: 'yolo   | After 3.1 imo',
        username: 'rio',
      },
    ];

    // Trigger
    const output = quote.rawChatToPossibleMessages(data);

    // Assert
    expect(output).toEqual(expectedMessages);
  });

  it('should not deconstruct anything on invalid strings', () => {
    const quote = new Quote();

    const inputs = [
      '[14:11] rio After 3.1 imo',
      'rio: asdf',
      'asdf [14:11] rio: After 3.1 imo',
      '[111:11] rio: After 3.1 imo',
    ];

    for (const input of inputs) {
      expect(quote.rawChatToPossibleMessages(input)).toEqual([]);
    }
  });
});
