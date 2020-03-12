import React, { ReactElement, useState } from 'react';
import { Message, Transition } from 'semantic-ui-react';

export type Message = {
  timestamp: Date;
  header: string;
  content?: string;
  type: 'error' | 'success';
}

export type Messages = Message[];

interface IFlashMessagesProps {
  messages: Messages;
};

interface IFlashProps {
  message: Message;
}

export const Flash = ({ message }: IFlashProps): ReactElement => {
  const [visible, setVisible] = useState(true);

  const handleDismiss = (): void => {
    setVisible(false);
  }

  return (
    <Transition visible={visible} animation='fade down' duration={500}>
      <Message
        onDismiss={handleDismiss}
        header={message.header}
        content={message.content}
        positive={message.type === 'success'}
        negative={message.type === 'error'}
      />
    </Transition>
  );
}

export const FlashMessages = ({ messages }: IFlashMessagesProps): ReactElement => {
  return (
    <div>
      {messages.map((message, i) => {
        return (
          <Flash
            key={message.timestamp.toString() + i.toString()}
            message={message}
          />
        );
    })}
    </div>
  );
}
