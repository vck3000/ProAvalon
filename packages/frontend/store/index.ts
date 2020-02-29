import {
  applyMiddleware,
  createStore,
  combineReducers,
  Middleware,
  Store,
  StoreEnhancer,
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';

import userOptionsReducer from './userOptions/reducers';
import { UserOptionsState } from './userOptions/types';

import rootSaga from './userOptions/sagas';

// Combine reducers and generate the type definition of the AppState
// https://github.com/reduxjs/redux/pull/3679
// ^explanation for combineReducers<{}>
const rootReducer = combineReducers<{ userOptions: UserOptionsState }>({
  userOptions: userOptionsReducer,
});

const bindMiddleware = (middleware: Middleware[]): StoreEnhancer => {
  if (process.env.NODE_ENV !== 'production') {
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

// Must manually declare the interface for the SagaStore
interface SagaStore extends Store {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sagaTask: any;
}

function configureStore(initialState: RootState): Store {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    rootReducer,
    initialState,
    bindMiddleware([sagaMiddleware]),
  );

  (store as SagaStore).sagaTask = sagaMiddleware.run(rootSaga);

  return store;
}

export type RootState = ReturnType<typeof rootReducer>;
export default configureStore;
