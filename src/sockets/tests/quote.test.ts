import { Quote, Message } from '../quote';

describe('Quote', () => {
  it('should say a new message is not a quote.', () => {
    // Setup
    const quote = new Quote();

    const message: Message = {
      message: 'Hello!',
      username: 'cin333',
    };

    // Trigger...

    // Assert
    expect(quote.isQuote(message, 'allchat')).toEqual(false);
  });

  it('should say a message is a quote for a previously seen message.', () => {
    const quote = new Quote();

    const message: Message = {
      message: 'Hello!',
      username: 'cin333',
    };

    quote.addMessage(message, 'allchat');

    expect(quote.isQuote(message, 'allchat')).toEqual(true);
  });

  it('should say a message is not a quote for a previously seen message in a different room.', () => {
    const quote = new Quote();

    const message: Message = {
      message: 'Hello!',
      username: 'cin333',
    };

    quote.addMessage(message, 'allchat');

    expect(quote.isQuote(message, 0)).toEqual(false);
  });

  it('should refresh room chat upon deletion', () => {
    const quote = new Quote();

    const message: Message = {
      message: 'Hello!',
      username: 'cin333',
    };

    quote.addMessage(message, 'allchat');
    expect(quote.isQuote(message, 'allchat')).toEqual(true);

    quote.deleteRoomMessages('allchat');
    expect(quote.isQuote(message, 'allchat')).toEqual(false);
  });

  it('should deconstruct multiple messages into separate messages', () => {
    const quote = new Quote();

    // Setup
    const data =
      '[14:11] rio: After 3.1 imo [14:11] thechessone: rio come play [14:11] rio: 3.1 is kinda merlinunt';

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
        message: '3.1 is kinda merlinunt',
        username: 'rio',
      },
    ];

    // Trigger
    const output = quote.deconstructRawChat(data);

    // Assert
    expect(output).toEqual(expectedMessages);
  });
});
