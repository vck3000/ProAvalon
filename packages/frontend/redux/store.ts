import { createStore, applyMiddleware, Middleware, StoreEnhancer, Store } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';

import rootReducer, { reducersState, ReducersState } from './reducers';
import rootSaga from './sagas';

interface Props extends Store {
  sagaTask: any;
}

const bindMiddleware = (middleware: Middleware[]): StoreEnhancer => {
  if (process.env.NODE_ENV !== 'production') {
    return composeWithDevTools(applyMiddleware(...middleware))
  }
  return applyMiddleware(...middleware)
}

function configureStore(initialState: ReducersState = reducersState): Store {
  const sagaMiddleware = createSagaMiddleware()
  const store = createStore(
    rootReducer,
    initialState,
    bindMiddleware([sagaMiddleware])
  );

  (store as Props).sagaTask = sagaMiddleware.run(rootSaga);

  return store;
}

export default configureStore;
