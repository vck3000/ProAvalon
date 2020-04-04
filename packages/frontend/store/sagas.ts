import { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { watchGetAllChat } from './chat/sagas';

export default function* rootSaga(): SagaIterator {
  // Add forks below
  yield fork(watchGetAllChat);
}
