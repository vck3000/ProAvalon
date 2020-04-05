import { ReactElement, useEffect } from 'react';
import { connect } from 'react-redux';

import LobbyIndex from '../components/lobby/lobbyIndex';
import { getAllChat } from '../store/chat/actions';

interface IProps {
  dispatchGetAllChat: typeof getAllChat;
}

const Lobby = ({ dispatchGetAllChat }: IProps): ReactElement => {
  // Get all chat on lobby load.
  useEffect(() => {
    dispatchGetAllChat();
  }, []);

  return (
    <>
      <title>Lobby</title>
      <LobbyIndex />
      <style global jsx>
        {`
          // CSS to make NextJS Page one page tall
          html,
          body,
          body > div:first-child,
          div#__next {
            height: 100%;
          }

          body {
            margin: 0px;
          }

          .ui.grid {
            margin: 0;
          }
        `}
      </style>
    </>
  );
};

const mapDispatchToProps = {
  dispatchGetAllChat: getAllChat,
};

export default connect(null, mapDispatchToProps)(Lobby);
