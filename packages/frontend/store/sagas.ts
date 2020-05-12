import { SagaIterator } from 'redux-saga';
import { all, fork } from 'redux-saga/effects';

import { chatSaga } from './chat/sagas';
import { authSaga } from './user/sagas';

export default function* rootSaga(): SagaIterator {
  // Add forks below
  yield all([fork(chatSaga), fork(authSaga)]);
}
