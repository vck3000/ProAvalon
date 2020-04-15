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
import { IUserOptionsState } from './userOptions/types';
import systemReducer from './system/reducers';
import { ISystemState } from './system/types';
import chatReducer, { IChatState } from './chat/reducers';
import playersReducer, { IOnlinePlayersState } from './onlinePlayers/reducers';

import rootSaga from './sagas';

// Combine reducers and generate the type definition of the AppState
// https://github.com/reduxjs/redux/pull/3679
// ^explanation for combineReducers<{}>
const rootReducer = combineReducers<{
  userOptions: IUserOptionsState;
  system: ISystemState;
  chat: IChatState;
  onlinePlayers: IOnlinePlayersState;
}>({
  userOptions: userOptionsReducer,
  system: systemReducer,
  chat: chatReducer,
  onlinePlayers: playersReducer,
});

const bindMiddleware = (middleware: Middleware[]): StoreEnhancer => {
  if (process.env.NODE_ENV !== 'production') {
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

// Must manually declare the interface for the SagaStore
interface ISagaStore extends Store {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sagaTask: any;
}

const sagaMiddleware = createSagaMiddleware();
export const store = createStore(
  rootReducer,
  {},
  bindMiddleware([sagaMiddleware]),
);

function configureStore(): Store {
  (store as ISagaStore).sagaTask = sagaMiddleware.run(rootSaga);
  return store;
}

export type RootState = ReturnType<typeof rootReducer>;
export default configureStore;
