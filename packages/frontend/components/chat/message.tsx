import React, { ReactElement } from 'react';

import { ChatResponse, ChatResponseType } from '@proavalon/proto/lobby';

interface IOwnProps {
  message: ChatResponse;
  opacity: number;
}

const getMessageClass = (type: ChatResponseType): string => {
  switch (type) {
    case ChatResponseType.PLAYER_JOIN_LOBBY:
    case ChatResponseType.PLAYER_LEAVE_LOBBY:
    case ChatResponseType.CREATE_GAME:
    case ChatResponseType.USER_COMMAND:
    case ChatResponseType.PLAYER_JOIN_GAME:
    case ChatResponseType.PLAYER_LEAVE_GAME:
      return 'meta';
    default:
      return '';
  }
};

const Message = (props: IOwnProps): ReactElement => {
  const { message, opacity } = props;
  return (
    <>
      <span className="timestamp">
        [{`0${message.timestamp.getHours() % 12}`.slice(-2)}:
        {`0${message.timestamp.getMinutes()}`.slice(-2)}]
      </span>

      <span className={getMessageClass(message.type)}>
        {message.type === ChatResponseType.CHAT && (
          <>
            <strong>{message.username}</strong>
            {`: `}
          </>
        )}
        {message.text}
      </span>

      <style jsx>
        {`
          span {
            opacity: ${opacity};
          }
        `}
      </style>
      <style jsx>
        {`
          span {
            color: var(--text);
          }

          .timestamp {
            color: var(--gold);
            font-variant-numeric: tabular-nums;
            padding-right: 5px;
          }

          .${ChatResponseType.SPY_WIN} {
            color: var(--text-win);
          }

          .meta {
            color: var(--text-gray);
          }
        `}
      </style>
    </>
  );
};

export default Message;
