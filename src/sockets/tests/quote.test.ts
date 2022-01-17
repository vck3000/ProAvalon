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
    expect(quote.isQuote(message)).toEqual(false);
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
    quote.addMessage(message);

    const message2: Message = {
      message: 'Hello!',
      username: 'cin333',
      timestamp: new Date(),
    };

    // Assertion
    expect(quote.isQuote(message2)).toEqual(true);
  });
});
