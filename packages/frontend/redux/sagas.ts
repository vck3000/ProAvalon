import { SagaIterator } from 'redux-saga';
import { put, all, call } from 'redux-saga/effects';

import { changeTheme } from './actions';

function* changeThemeSaga(): SagaIterator {
  yield put(changeTheme())
}

export default function* rootSaga(): SagaIterator {
  yield all([
    call(changeThemeSaga)
  ])
}
