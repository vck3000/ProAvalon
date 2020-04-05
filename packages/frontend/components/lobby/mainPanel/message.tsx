import React, { ReactElement } from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../../store';
import { ThemeOptions } from '../../../store/userOptions/types';
import { IMessage } from '../../../store/chat/message.types';

interface IStateProps {
  theme: ThemeOptions;
}

interface IOwnProps {
  message: IMessage;
  opacity: number;
}

type Props = IOwnProps & IStateProps;

const Message = (props: Props): ReactElement => {
  const { theme, message, opacity } = props;

  return (
    <span className="wrapper">
      <span className="timestamp">
        [{`0${new Date(message.timestamp).getHours() % 12}`.slice(-2)}:
        {`0${new Date(message.timestamp).getMinutes()}`.slice(-2)}]
      </span>

      <span className={message.type}>
        {message.type === 'chat' ? (
          <span className="pad_left">{message.username}: </span>
        ) : null}

        {message.type === 'chat' ? (
          <span>{message.text}</span>
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

          .spy_win {
            color: ${theme.colors.TEXT_RED};
          }

          .player_join_lobby,
          .player_leave_lobby,
          .create_room {
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
