import { ChatSpamFilter } from '../chatSpamFilter';

describe('Chat Spam Filter', () => {
  it('should allow a user to chat when no messages have been sent', () => {
    const chatSpamFilter = new ChatSpamFilter();
    expect(chatSpamFilter.chatRequest('pronub')).toEqual(true);
  });

  it('should allow user to chat again after cooldown has expired', () => {
    // Setup
    const chatSpamFilter = new ChatSpamFilter();

    // Trigger - force a cooldown
    for (let i = 0; i < 10; i++) {
      chatSpamFilter.chatRequest('pronub');
    }

    // Assertion
    expect(chatSpamFilter.chatRequest('pronub')).toEqual(false);

    // Wait 6 seconds
    for (let i = 0; i < 6; i++) {
      chatSpamFilter.tick();
    }

    expect(chatSpamFilter.chatRequest('pronub')).toEqual(true);
  });
});
