import { ChatSpamFilter } from '../chatSpamFilter';

describe('Chat Spam Filter', () => {
  it('should allow a user to chat when no messages have been sent', () => {
    const chatSpamFilter = new ChatSpamFilter();

    expect(chatSpamFilter.chatRequest('pronub')).toEqual(true);
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

  it('Disconnecting as an existing chatter from the server results in the user being removed', () => {
    const chatSpamFilter = new ChatSpamFilter();
    //Person doesnt exist, since its not an existing chatter
    expect(chatSpamFilter.disconnectUser('Person1')).toEqual(false);

    chatSpamFilter.chatRequest('Person1');

    expect(chatSpamFilter.disconnectUser('Person1')).toEqual(true);
    //user doesnt exist anymore
    expect(chatSpamFilter.disconnectUser('Person1')).toEqual(false);
  });

  it('Reconnecting the server refreshes the cooldown period', () => {
    const chatSpamFilter = new ChatSpamFilter();

    for (let i = 0; i < 6; i++) {
      chatSpamFilter.chatRequest('Person1');
    }

    expect(chatSpamFilter.chatRequest('Person1')).toEqual(false);

    chatSpamFilter.disconnectUser('Person1');

    expect(chatSpamFilter.chatRequest('Person1')).toEqual(true);
  });
});
