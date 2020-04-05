import React, { ReactElement } from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../../store';
import { ThemeOptions } from '../../../store/userOptions/types';
import { ChatResponse } from '../../../proto/bundle';
import { protoTimestampToDate as pttd } from '../../../proto/timestamp';

const ChatType = ChatResponse.ChatResponseType;

interface IStateProps {
  theme: ThemeOptions;
}

interface IOwnProps {
  message: ChatResponse;
  opacity: number;
}

type Props = IOwnProps & IStateProps;

const Message = (props: Props): ReactElement => {
  const { theme, message, opacity } = props;

  return (
    <span className="wrapper">
      <span className="timestamp">
        [{`0${pttd(message.timestamp).getHours() % 12}`.slice(-2)}:
        {`0${pttd(message.timestamp).getMinutes()}`.slice(-2)}]
      </span>

      <span className={message.type.toString()}>
        {message.type === ChatType.CHAT ? (
          <>
            <span className="pad_left">{message.username}: </span>
            <span>{message.text}</span>
          </>
        ) : (
          <span className="pad_left">{message.text}</span>
        )}
      </span>

      <style jsx>
        {`
          .wrapper {
            font-family: Montserrat-Bold;
            color: ${theme.colors.TEXT};
            opacity: ${opacity};
          }

          .timestamp {
            color: ${theme.colors.GOLD};
          }

          .pad_left {
            padding-left: 5px;
          }

          .${ChatType.SPY_WIN} {
            color: ${theme.colors.TEXT_RED};
          }

          .${ChatType.PLAYER_JOIN_LOBBY},
            .${ChatType.PLAYER_LEAVE_LOBBY},
            .${ChatType.CREATE_ROOM} {
            color: ${theme.colors.TEXT_GRAY};
          }
        `}
      </style>
    </span>
  );
};

const mapStateToProps = (state: RootState): IStateProps => ({
  theme: state.userOptions.theme,
});

export default connect(
  mapStateToProps,
  null,
)(Message as (props: IOwnProps) => ReactElement);
