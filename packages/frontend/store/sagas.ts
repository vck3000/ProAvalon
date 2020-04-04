import { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { chatSaga } from './chat/sagas';

export default function* rootSaga(): SagaIterator {
  // Add forks below
  yield fork(chatSaga);
}
