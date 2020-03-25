import React, { ReactElement } from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../store';
import { ThemeOptions } from '../../store/userOptions/types';

import Message, { IMessage } from './message';

interface IStateProps {
  theme: ThemeOptions;
}

function* dateGenerator(): Generator {
  let d = 1583135940000;
  while (true) {
    d += 1;
    yield d;
  }
}

export const dateGenObj = dateGenerator();

const messages: IMessage[] = [
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `Nikolaj has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `Maria has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `Nikolaj has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `Maria has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `Nikolaj has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `Maria has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `Nikolaj has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `Maria has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `Maria has joined the lobby.`,
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `Bassem has joined the lobby.`,
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    message: `btw im copying this chat for something im making`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    message: `you gotta avalon`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `benjk has joined the lobby.`,
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    message: `so keep that in mind`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `benjk has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `benjk has joined the lobby.`,
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'helloperson',
    message: `hey pam`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    message: `hi person`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    message: `tofy cutie`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    message: `nou`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'Maria',
    message: `yes`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    message: `we can start over`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'Maria',
    message: `!`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    message: `hai`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    message: `the chat`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    message: `helloperson`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `Maria has created room #193`,
    type: 'create_room',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'Maria',
    message: `nou`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    message: `bass`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    message: `...`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    message: `WE JUST`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    message: `STARTED AGAIN`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    message: `it's ok, i can remove bass`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    message: `:D`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'Bassem',
    message: `</3`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'helloperson',
    message: `lol`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    message: `Maria has joined the lobby`,
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    message: `Room 141 has finished! The Spies have won!`,
    type: 'spy_win',
  },
];

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

const Chat = (props: Props): ReactElement => {
  const { theme } = props;

  return (
    <>
      <div className="wrapper">
        <div className="chat">
          <ul className="chat_list">
            {messages.map((message, i) => (
              <li key={message.timestamp.getTime()}>
                <Message
                  message={message}
                  opacity={GetOpacity(i, messages.length)}
                />
              </li>
            ))}
            <li className="chat_bottom_padding" />
          </ul>
        </div>
        <input className="text_input" placeholder="Type your message here..." />
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

const mapStateToProps = (state: RootState): IStateProps => ({
  theme: state.userOptions.theme,
});

export default connect(mapStateToProps, null)(Chat as () => ReactElement);
