import React, { ReactElement } from 'react';

import { ChatResponse, ChatResponseType } from '../../../proto/lobbyProto';

interface IOwnProps {
  message: ChatResponse;
  opacity: number;
}

const Message = (props: IOwnProps): ReactElement => {
  const { message, opacity } = props;
  return (
    <span className="wrapper">
      <span className="timestamp">
        [{`0${message.timestamp.getHours() % 12}`.slice(-2)}:
        {`0${message.timestamp.getMinutes()}`.slice(-2)}]
      </span>

      <span className={`chat${message.type}`}>
        <span className="pad_left">
          {message.type === ChatResponseType.CHAT && `${message.username}: `}
          {message.text}
        </span>
      </span>

      <style jsx>
        {`
          .wrapper {
            font-family: Montserrat-Bold;
            color: var(--text);
            opacity: ${opacity};
          }

          .timestamp {
            color: var(--gold);
            font-variant-numeric: tabular-nums;
          }

          .pad_left {
            padding-left: 5px;
          }

          .${ChatResponseType.SPY_WIN} {
            color: var(--text-win);
          }

          .chat${ChatResponseType.PLAYER_JOIN_LOBBY},
            .chat${ChatResponseType.PLAYER_LEAVE_LOBBY},
            .chat${ChatResponseType.CREATE_ROOM},
            .chat${ChatResponseType.USER_COMMAND} {
            color: var(--text-gray);
          }
        `}
      </style>
    </span>
  );
};

export default Message;
