import { ChatSpamFilter } from '../chatSpamFilter';

describe('Chat Spam Filter', () => {
  it('should allow a user to chat when no messages have been sent', () => {
    const chatSpamFilter = new ChatSpamFilter();
    expect(chatSpamFilter.chatRequest('pronub')).toEqual(true);
  });

  it('Calling tick should increment seconds correctly', () => {
    const chatSpamFilter = new ChatSpamFilter();
    expect(chatSpamFilter.getSeconds()).toEqual(0);
    chatSpamFilter.tick();
    chatSpamFilter.tick();
    expect(chatSpamFilter.getSeconds()).toEqual(2);
  });

  it('should allow user to chat again after cooldown has expired', () => {
    const chatSpamFilter = new ChatSpamFilter();

    for (let i = 0; i < 6; i++) {
      chatSpamFilter.chatRequest('pronub');
    }

    expect(chatSpamFilter.chatRequest('pronub')).toEqual(false);

    for (let i = 0; i < 6; i++) {
      chatSpamFilter.tick();
    }

    expect(chatSpamFilter.chatRequest('pronub')).toEqual(true);
  });

  it('Chat spam filter is targetted individually, rather than collectively', () => {
    const chatSpamFilter = new ChatSpamFilter();
    chatSpamFilter.chatRequest('LoremUser');
    for (let i = 0; i < 6; i++) {
      chatSpamFilter.chatRequest('IpsumUser');
    }
    expect(chatSpamFilter.chatRequest('LoremUser')).toEqual(true);
    expect(chatSpamFilter.chatRequest('IpsumUser')).toEqual(false);
  });
});
