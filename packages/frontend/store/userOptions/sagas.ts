import { SagaIterator } from 'redux-saga';
import { all } from 'redux-saga/effects';

export default function* rootSaga(): SagaIterator {
  yield all([]);
}
