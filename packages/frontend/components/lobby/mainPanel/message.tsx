import React, { ReactElement } from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../../store';
import { ThemeOptions } from '../../../store/userOptions/types';
import { ChatResponse, ChatResponseType } from '../../../proto/lobbyProto';

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
            color: ${theme.colors.TEXT};
            opacity: ${opacity};
          }

          .timestamp {
            color: ${theme.colors.GOLD};
            font-variant-numeric: tabular-nums;
          }

          .pad_left {
            padding-left: 5px;
          }

          .${ChatResponseType.SPY_WIN} {
            color: ${theme.colors.TEXT_RED};
          }

          .chat${ChatResponseType.PLAYER_JOIN_LOBBY},
            .chat${ChatResponseType.PLAYER_LEAVE_LOBBY},
            .chat${ChatResponseType.CREATE_ROOM},
            .chat${ChatResponseType.USER_COMMAND} {
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
