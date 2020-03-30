import { SagaIterator } from 'redux-saga';
import { all, fork } from 'redux-saga/effects';

import { getAllChat } from './chat/sagas';

export default function* rootSaga(): SagaIterator {
  yield all([fork(getAllChat)]);
}
