import { SagaIterator } from 'redux-saga';
import { all, fork } from 'redux-saga/effects';

import { watchLogin } from './authentication/sagas';

export default function* rootSaga(): SagaIterator {
  yield all([
    fork(watchLogin),
  ]);
}
