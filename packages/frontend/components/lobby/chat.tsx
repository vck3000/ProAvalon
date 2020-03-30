import React, { ReactElement, useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';

import socket from '../../socket/socket';

import { RootState } from '../../store';
import { ThemeOptions } from '../../store/userOptions/types';
import Message from './message';
import { IMessage } from '../../store/chat/types';

interface IStateProps {
  theme: ThemeOptions;
  messages: IMessage[];
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

const Chat = ({ theme, messages }: Props): ReactElement => {
  const [messageText, setMessageText] = useState('');
  const [scrollDown, setScrollDown] = useState(true);
  const chatRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const SCROLL_CUTOFF = 40;
    if (chatRef.current) {
      const scrollDistance =
        chatRef.current.scrollHeight -
        chatRef.current.scrollTop -
        chatRef.current.clientHeight;
      if (
        (scrollDown && scrollDistance > SCROLL_CUTOFF) ||
        (!scrollDown && scrollDistance <= SCROLL_CUTOFF)
      ) {
        setScrollDown(!scrollDown);
      }

      if (scrollDown) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }
  }, [messages.length]);

  return (
    <>
      <div className="wrapper">
        <div className="chat">
          <ul className="chat_list" ref={chatRef}>
            {messages.map((chatMessage: IMessage, i: number) => (
              <li key={new Date(chatMessage.timestamp).getTime()}>
                <Message
                  message={chatMessage}
                  opacity={GetOpacity(i, messages.length)}
                />
              </li>
            ))}
            <li className="chat_bottom_padding" />
          </ul>
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
              // set new timestamp when emitting message to server
              socket.emit('allChatToServer', messageText);
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
            background-color: ${theme.colors.LIGHT};
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
            background-color: ${theme.colors.LIGHT};
          }

          .chat_list::-webkit-scrollbar {
            background-color: ${theme.colors.ALT_LIGHT};
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
            background-color: ${theme.colors.ALT_LIGHT};
            padding: 10px 20px;
            color: ${theme.colors.TEXT};
          }

          .text_input:placeholder {
            color: ${theme.colors.GOLD};
            font-family: Montserrat-Bold;
          }
        `}
      </style>
    </>
  );
};

const mapStateToProps = (
  state: RootState,
): Pick<IStateProps, 'theme' | 'messages'> => ({
  theme: state.userOptions.theme,
  messages: state.chat.messages,
});

export default connect(mapStateToProps, null)(Chat as () => ReactElement);
