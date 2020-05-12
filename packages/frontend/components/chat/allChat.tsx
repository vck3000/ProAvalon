import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

import Chat from './chat';

const AllChat = (): ReactElement => {
  const messages = useSelector((state: RootState) => state.chat.messages);

  return <Chat messages={messages} />;
};

export default AllChat;
