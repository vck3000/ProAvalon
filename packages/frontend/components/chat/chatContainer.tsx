import { ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { chatSelector, ChatID } from '../../store/chat/reducers';

import Chat from './chat';
import { emitMessage } from '../../store/chat/actions';

type Props = {
  id: ChatID;
};

const ChatContainer = ({ id }: Props): ReactElement => {
  const messages = useSelector(chatSelector(id));

  const dispatch = useDispatch();
  const sendMessage = (message: string): ReturnType<typeof emitMessage> =>
    dispatch(emitMessage({ chatID: id, message }));

  return <Chat messages={messages} sendMessage={sendMessage} />;
};

export default ChatContainer;
