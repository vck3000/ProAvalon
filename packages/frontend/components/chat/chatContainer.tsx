import { ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { chatSelector, ChatType } from '../../store/chat/reducers';

import Chat from './chat';
import { emitMessage } from '../../store/chat/actions';

type Props = {
  type: ChatType;
};

const ChatContainer = ({ type }: Props): ReactElement => {
  const messages = useSelector(chatSelector(type));

  const dispatch = useDispatch();
  const sendMessage = (message: string): ReturnType<typeof emitMessage> =>
    dispatch(emitMessage({ type, message }));

  return <Chat messages={messages} sendMessage={sendMessage} />;
};

export default ChatContainer;
