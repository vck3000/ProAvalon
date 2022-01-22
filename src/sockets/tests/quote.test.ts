import { Quote, Message } from '../quote';

describe('Quote', () => {
  it('should say a new message is not a quote.', () => {
    // Setup
    const quote = new Quote();

    const message: Message = {
      message: 'Hello!',
      username: 'cin333',
      timestamp: new Date(),
    };

    // Assertion
    expect(quote.isQuote(message, 'allchat')).toEqual(false);
  });


  it('should say a message is a quote for a previously seen message.', () => {
    // Setup
    const quote = new Quote();

    const message: Message = {
      message: 'Hello!',
      username: 'cin333',
      timestamp: new Date(),
    };

    // Trigger
    quote.addMessage(message, 'allchat');

    const message2: Message = {
      message: 'Hello!',
      username: 'cin333',
      timestamp: message.timestamp
    };

    // Assertion
    expect(quote.isQuote(message2, 'allchat')).toEqual(true);

    // const message3: Message = {
    //   message: 'hello!',
    //   username: 'cin333',
    //   timestamp: message.timestamp
    // };

    // // Assertion
    // expect(quote.isQuote(message3)).toEqual(false);
  });

  it('should say a message is not a quote for a previously seen message in a different room.', () => {
    // Setup
    const quote = new Quote();

    const message: Message = {
      message: 'Hello!',
      username: 'cin333',
      timestamp: new Date(),
    };

    // Trigger
    quote.addMessage(message, 'allchat');
    
    // Assertion
    expect(quote.isQuote(message, 0)).toEqual(false);
  });
});
