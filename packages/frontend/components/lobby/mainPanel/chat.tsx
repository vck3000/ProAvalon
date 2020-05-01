import React, { ReactElement, useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';

import socket from '../../../socket';

import { RootState } from '../../../store';
import Message from './message';
import {
  SocketEvents,
  ChatRequest,
  ChatResponse,
} from '../../../proto/lobbyProto';
import { NoSSR } from '../../../utils/noSSR';
import { murmurhash } from '../../../utils/hash';

interface IStateProps {
  messages: ChatResponse[];
}

type Props = IStateProps;

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

const Chat = ({ messages }: Props): ReactElement => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [messageText, setMessageText] = useState('');
  const chatRef = useRef<HTMLUListElement>(null);

  useEffect((): void | (() => void | undefined) => {
    const SCROLL_CUTOFF = 40;
    const chat = chatRef.current;
    if (chat) {
      const scrollToTop = (): void => {
        chat.scrollTop = chat.scrollHeight;
      };

      const scrollDistance =
        chat.scrollHeight - chat.scrollTop - chat.clientHeight;
      if (scrollDistance < SCROLL_CUTOFF) {
        scrollToTop();
      }

      if (!isLoaded) {
        scrollToTop();
        setIsLoaded(true);
      }
    }
    return undefined;
  }, [messages.length]);

  return (
    <>
      <div className="wrapper">
        <div className="chat">
          <NoSSR fallback={<div>Loading...</div>}>
            <ul className="chat_list" ref={chatRef}>
              {messages.map((chatMessage: ChatResponse, i: number) => (
                <li
                  key={murmurhash(
                    chatMessage.text,
                    chatMessage.timestamp.getTime(),
                  )}
                >
                  <Message
                    message={chatMessage}
                    opacity={GetOpacity(i, messages.length)}
                  />
                </li>
              ))}
              <li className="chat_bottom_padding" />
            </ul>
          </NoSSR>
        </div>
        <input
          className="text_input"
          placeholder="Type your message here..."
          value={messageText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
            setMessageText(e.target.value);
          }}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>): void => {
            if (e.key === 'Enter' && messageText) {
              const msg: ChatRequest = {
                text: messageText,
              };
              socket.emit(SocketEvents.ALL_CHAT_TO_SERVER, msg);
              setMessageText('');
            }
          }}
        />
      </div>
      <style jsx>
        {`
          .wrapper {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .chat {
            position: relative;
            background-color: var(--light);
            height: 100%;
          }

          .chat_list {
            position: absolute;
            top: 0px;
            list-style: none;
            max-height: 100%;
            width: 100%;
            overflow: auto;
            margin: 0;
            padding-top: 5px;
            padding-left: 15px;
          }

          .chat_list::-webkit-scrollbar {
            width: 0.5em;
          }

          .chat_list::-webkit-scrollbar-track {
            background-color: var(--light);
          }

          .chat_list::-webkit-scrollbar {
            background-color: var(--light-alt);
          }

          .chat_list li {
            padding-top: 1px;
          }

          .chat_bottom_padding {
            height: 10px;
            width: 100%;
          }

          .text_input {
            width: 100%;
            border: 0;
            border-radius: 0;
            background-color: var(--light-alt);
            padding: 10px 20px;
            color: var(--text);
          }

          .text_input:placeholder {
            color: var(--gold);
            font-family: Montserrat-Bold;
          }
        `}
      </style>
    </>
  );
};

const mapStateToProps = (state: RootState): Pick<IStateProps, 'messages'> => ({
  messages: state.chat.messages,
});

export default connect(mapStateToProps, null)(Chat as () => ReactElement);
