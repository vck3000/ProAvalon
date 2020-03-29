import React, { ReactElement, useEffect } from 'react';
import { connect } from 'react-redux';

import socket from '../../socket/socketConnection';
import { RootState } from '../../store';
import { ThemeOptions } from '../../store/userOptions/types';

import Message from './message';
import { IMessage } from '../../store/chat/types';
import { setMessage, receivedMessage } from '../../store/chat/actions';

interface IStateProps {
  theme: ThemeOptions;
  message: IMessage;
  messages: IMessage[];
  dispatchSetMessage: typeof setMessage;
  dispatchReceivedMessage: typeof receivedMessage;
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

const Chat = ({
  theme,
  message,
  messages,
  dispatchSetMessage,
  dispatchReceivedMessage,
}: Props): ReactElement => {
  useEffect(() => {
    socket.on('msgToClient', (messageReceived: IMessage) => {
      // eslint-disable-next-line no-console
      console.log('msgToClient');
      dispatchReceivedMessage(messageReceived);
    });
  }, []);

  return (
    <>
      <div className="wrapper">
        <div className="chat">
          <ul className="chat_list">
            {messages.map((chatMessage: IMessage, i: number) => (
              <li key={chatMessage.id}>
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
          value={message.messageText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
            dispatchSetMessage(e.target.value);
          }}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>): void => {
            if (e.key === 'Enter') {
              // set new timestamp when emitting message to server
              socket.emit('msgToServer', { ...message, timestamp: new Date() });
              dispatchSetMessage('');
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
): Pick<IStateProps, 'theme' | 'message' | 'messages'> => ({
  theme: state.userOptions.theme,
  message: state.chat.message,
  messages: state.chat.messages,
});

const mapDispatchToProps = {
  dispatchSetMessage: setMessage,
  dispatchReceivedMessage: receivedMessage,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Chat as () => ReactElement);
