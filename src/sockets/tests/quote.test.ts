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

    // Trigger...

    // Assert
    expect(quote.isQuote(message, 'allchat')).toEqual(false);
  });


  it('should say a message is a quote for a previously seen message.', () => {
    const quote = new Quote();

    const message: Message = {
      message: 'Hello!',
      username: 'cin333',
      timestamp: new Date(),
    };

    quote.addMessage(message, 'allchat');

    expect(quote.isQuote(message, 'allchat')).toEqual(true);
  });

  it('should say a message is not a quote for a previously seen message in a different room.', () => {
    const quote = new Quote();

    const message: Message = {
      message: 'Hello!',
      username: 'cin333',
      timestamp: new Date(),
    };

    quote.addMessage(message, 'allchat');
    
    expect(quote.isQuote(message, 0)).toEqual(false);
  });

  it('should refresh room chat upon deletion', () => {
    const quote = new Quote();

    const message: Message = {
      message: 'Hello!',
      username: 'cin333',
      timestamp: new Date(),
    };

    quote.addMessage(message, 'allchat');
    expect(quote.isQuote(message, 'allchat')).toEqual(true);

    quote.deleteRoomMessages('allchat')
    expect(quote.isQuote(message, 'allchat')).toEqual(false);
  });
});
