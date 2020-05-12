import { ReactElement, useState, useRef, useEffect, UIEvent } from 'react';

import Message from './message';
import {
  ChatResponse,
  ChatRequest,
  SocketEvents,
} from '../../proto/lobbyProto';
import socket from '../../socket';
import debounce from '../../utils/debounce';

const lastTransparentLine = 60;
const GetOpacity = (i: number, numMessages: number): number => {
  // opacity = i + (x - num) / x, where x is the lastTransparentLine
  // Need to offset as we display the chat from top to bottom.
  // Minimum opacity of 0.33
  return Math.max(
    (i + (lastTransparentLine - numMessages) + 1) / lastTransparentLine,
    0.33,
  );
};

interface IProps {
  messages: ChatResponse[];
}

const Chat = ({ messages }: IProps): ReactElement => {
  const [input, setInput] = useState('');

  const [hasScrolled, setHasScrolled] = useState(false);
  const lastMessage = useRef<HTMLLIElement>(null);

  // store the debounced function in a hook so chat can be used twice on page
  const setScrollState = useRef(
    debounce((list): void => {
      setHasScrolled(
        list.scrollHeight - list.scrollTop - list.clientHeight >= 40,
      );
    }, 150),
  ).current;

  useEffect(() => {
    if (!hasScrolled && lastMessage.current)
      lastMessage.current.scrollIntoView({ behavior: 'auto' });
  }, [messages.length]);

  const handleScroll = (event: UIEvent<HTMLUListElement>): void => {
    const list = event.target as HTMLUListElement;

    setScrollState(list);
  };

  return (
    <>
      <div>
        <ul onScroll={handleScroll}>
          {messages.map((message: ChatResponse, i: number) => (
            <li
              key={
                message.timestamp.getTime() + message.username + message.text
              }
              ref={i === messages.length - 1 ? lastMessage : undefined}
            >
              <Message
                message={message}
                opacity={GetOpacity(i, messages.length)}
              />
            </li>
          ))}
        </ul>
        <input
          placeholder="Type your message here ..."
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
            setInput(e.target.value);
          }}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>): void => {
            if (e.key === 'Enter' && input) {
              const msg: ChatRequest = {
                text: input,
              };
              socket.emit(SocketEvents.ALL_CHAT_TO_SERVER, msg);
              setInput('');
            }
          }}
        />
      </div>
      <style jsx>
        {`
          div {
            height: 100%;
            display: flex;
            flex-flow: column;
            background: var(--light);
          }

          input {
            padding: 16px;
            width: 100%;
            border: 0;
            background: var(--light-alt);
            font-family: 'Montserrat'; // because semantic-ui overrides it
            font-weight: 700;
            color: var(--gold);
          }
          ul {
            list-style: none;
            margin: 0;
            padding: 0 16px;
            height: 0;
            flex: 1 1 auto;
            overflow-y: auto;
          }
        `}
      </style>
    </>
  );
};

export default Chat;
